//
// 【AnimeTalkEvent lambda】
//
//  概要: アニメトークイベントお知らせAlexaスキルで利用するためのlambda関数
//　　　　 githubで公開しているのでApplicationIDは環境変数経由で設定すること。
//
//  更新履歴:
//          2018.07.01 新規作成  
//          2018.07.08 開発中
//
'use strict';
const Alexa = require('ask-sdk-v1adapter');
var scraping = require('./scraping.js');
var APP_ID = process.env.APP_ID // 注意) APP_ID はlambdaの環境変数経由でセットする
var SKILL_NAME = "アニメトークイベントお知らせ";
var LUNCH_MESSAGE = "アニメトークイベントお知らせスキルへようこそ。\
このスキルではアニメトークイベントをチェックできます。\
予定されているアニメトークイベントを知りたいですか？　知りたい場合は「はい」と言ってください。";
var HELP_MESSAGE = "アニメトークイベント情報を知りたい場合は、\
「イベント情報教えて」、本スキルを終了したいときは「終了」と言ってください。";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "ご利用ありがとうございました。スキルを終了します。";
// スクレイピングを再実行する時間24時間経過したら再取得する。
var INTERVAL_TIME = 86400;

// AWSのLambdaのハンドラー
//
// ハンドラってなに？
// --
// ハンドラはプログラム中で関数やサブルーチンなどの形で実装され、
// メモリ上に展開されるが、通常のプログラムの流れには組み込まれず、普段は待機している。
// そのハンドラが対応すべき処理要求が発生するとプログラムの流れを中断してハンドラが呼び出され、
// 要求された処理を実行する関数および、サブルーチンです。
// --
// http://e-words.jp/w/%E3%83%8F%E3%83%B3%E3%83%89%E3%83%A9.html 参照
//
// Lambdaのハンドラは引数に event, context, callback(option)を受け取ります
// Lambdaのハンドラの定義はこちらに記載されています。
// https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-prog-model-handler.html
//
exports.handler = function(event, context, callback) {
    // Lambdaハンドラで渡されてきた event, context オブジェクトをそのまま
    // Alexaハンドラに渡して、Alexaインスタンスを作成します。
    // Alexaインスタンスは alexa という名前でインスタンス化されました。
    // これはもう定形なのでそうしてくださな。
    var alexa = Alexa.handler(event, context);
    alexa.appId = process.env.APP_ID;
    // アニメイベント情報を保存するDynamoDB
    alexa.dynamoDBTableName = 'AnimeEventTable'; 
    // Alexaインスタンスへ直下で定義されたハンドラを登録します
    // このハンドラの実装および、ハンドラ自信がAlexaの動作を決めます。
    alexa.registerHandlers(handlers);
    // Alexaインスタンスを実行します。
    alexa.execute();
};

// 大域変数を利用して内部状態を管理するためにSTATEを利用します
// 状態変数を管理する場合は this.ttributes へ保存して動作を変更する
// 
// START:  初回起動時
// SEARCH: 検索時(情報提供時)
// FINISH: 全部のコメントを読み上げたという状態
var states = {
    LUNCH: '_LUNCH',
    SEARCH: '_SEARCH',
    FINISH: '_FINISH',
}

// このハンドラの定義が重要です
// このハンドラがAlexaの動作を決めます。
var handlers = {
    // ユーザーが、呼び出し名のみでスキルを呼び出し、
    // インテントに対応するコマンドを言わなかった場合、
    // サービスはLaunchRequestを受け取ります。
    // 「Alexa,アニメトークイベントのお知らせを開いて」などの場合
    'LaunchRequest': function () {
        this.attributes['state'] = states.LUNCH;
        // AnimeTalkEventInetnt へThrough します
        this.emit('AnimeTalkEventInetnt');
    },

    // アニメトークイベントインテント
    'AnimeTalkEventInetnt': function(){
        this.emit(':tell', "test");

        // 現在時間情報
        var date = new Date() ;
        var x = date.getTime();
        var utime = Math.floor(x/1000);       
        var event = undefined;
        if(this.attributes['state'] == states.LUNCH){
            // statesをSEARCHに設定する
            this.attributes['state'] = states.SEARCH;
            this.emit(':ask', LUNCH_MESSAGE)
        }else if(this.attributes['state'] == states.SEARCH){
            // 終了ステータスを付与
            this.attributes['state'] = states.FINISH;
            // 作成済みのevent情報が存在するか確認
            if(this.attributes['event']){
                if((utime - this.attributes["time"]) > INTERVAL_TIME){
                    // データを取得してから24時間経過した場合,検索結果を再取得する
                    event = scraping.event_search();
                }else{
                    // データを取得してから24時間経過していない場合は保存されているデータを利用する
                    event = this.attributes['event'];
                };
            }else{
                // イベント情報を取得
                event = scraping.event_search();
                this.attributes['event'] = event;
                this.attributes['time'] = utime;
            };

            // event 情報の読み上げ文字列を作成
            var msg = "";
            for(key in event){
                var place = key;
                var msg = place + "の情報をお知らせします。\n"
                var ary = event[place];
                for(var i = 0; i < ary.length; i++){
                    msg = msg + ary[0] + "\n" + ary[1];
                }
            }
            // statusを完了に変更
            this.attributes['state'] = states.FINISH;
            this.emit(':tell',msg);
        }else if(this.attributes['state'] == states.FINISH){
            // 終了の言葉を創出
            this.emit('SessionEndedRequest')
        }  
    },

    // AMAZON.YESInentを利用して検索を開始するか確認する
    'AMAZON.YesIntent': function(){
        if(this.attributes['state'] == states.SEARCH){
            this.emit('AnimeTalkEventInetnt');
        }else{
            this.emit('LaunchRequest');
        }
    },

    // ヘルプ動作にときに呼ばれるインテント
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    // キャンセルのときに呼ばれるインテント
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    // ストップ時に呼ばれるインテント
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },

    // スキルを終了するときに呼ばれるインテント
    'SessionEndedRequest': function () {
	this.emit(':tell', STOP_MESSAGE);  
    }
};
