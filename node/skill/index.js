//
// 【AnimeTalkEvent lambda】
//
//  概要: アニメトークイベントお知らせAlexaスキルで利用するためのlambda関数
//　　　　 githubで公開しているのでApplicationIDは環境変数経由で設定すること。
//
//  更新履歴:
//          2018.07.01 新規作成  
//
'use strict';
const Alexa = require('ask-sdk-v1adapter');
var export_function = require('scraping.js');
var APP_ID = process.env.APP_ID // 注意) APP_ID はlambdaの環境変数経由でセットする
var SKILL_NAME = "アニメトークイベントお知らせ";
var LUNCH_MESSAGE = "アニメトークイベントお知らせスキルへようこそ。\
このスキルではアニメトークイベントをチェックできます。\
予定されているアニメトークイベントを知りたいですか？";
var HELP_MESSAGE = "アニメトークイベント情報を知りたい場合は、\
「イベント情報教えて」、本スキルを終了したいときは「終了」と言ってください。";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "ご利用ありがとうございました。スキルを終了します。";

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
    alexa.APP_ID = APP_ID;
    // Alexaインスタンスへ直下で定義されたハンドラを登録します
    // このハンドラの実装および、ハンドラ自信がAlexaの動作を決めます。
    alexa.registerHandlers(handlers);
    // Alexaインスタンスを実行します。
    alexa.execute();
};

// 大域変数を利用して内部状態を管理するためにSTATEを利用します
// his.handler.state へ保存できる。
// STARTMODE:  初回起動時
// SEARCHMODE: 検索時(情報提供時)
// FINISH: 全部のコメントを読み上げたという状態
var states = {
    STARTMODE: '_STARTMODE',
    SEARCHMODE: '_SEARCHMODE',
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
        // AnimeTalkEventInetnt へThrough します
        this.emit('AnimeTalkEventInetnt');
    },
    // アニメトークイベントインテント
    'AnimeTalkEventInetnt': function(){
        if(this.handler.state === undefined){
            // ステートを設定(一度説明を聞いた場合)
            this.handler.state = states.SEARCHMODE;
            // スキルの説明を実施
            this.emit(':ask', LUNCH_MESSAGE)
        }else if(this.handler.state === stats.STARTMODE){
            // 終了ステータスを付与
            this.handler.state = stats.FINISH;
            // 検索を実施して応答文を生成
            

        }else if(this.handler.state === stats.FINISH){
            // 終了の言葉を創出
            this.emit('SessionEndedRequest')
        }  
    },

    // AMAZON.YESInentを利用して検索を開始するか確認する
    'AMAZON.YesIntent': function(){
        if(this.handler.state === states.SEARCHMODE){
            this.emit('AnimeTalkEventInetnt');
        };
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
