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
このスキルではあなたの興味のあるアニメトークイベントをチェックできます。\
予定されているアニメトークイベントを知りたいですか？";
var HELP_MESSAGE = "アニメトークイベント情報を知りたい場合は、\
「イベント情報教えて」、本スキルを終了したいときは「終了」と言ってください。";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "ご利用ありがとうございます。スキルを終了します。";

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

// このハンドラの定義が重要です
// このハンドラがAlexaの動作を決めます。
// 書き方はなんかイメージでいると思いますが
// 
//  'インテント名': 関数定義
// ここで覚えることは、 emit で情報を送出すること
// emit時のkeyは 
// 
var handlers = {
    //　起動時のハンドラは LaunchRequest というハンドラインテント名
    'LaunchRequest': function () {
        // 起動時に指定したインテントがcallされるように設定する
        this.emit(':ask', HELP_MESSAGE);
        //this.emit('GreetingIntent');
    },
    // 挨拶の動作コードを記載
    'GreetingIntent': function(){
        // 実行した時間毎に異なる挨拶を生成
        var greet = getGreeting();
        //　emit 時の key:
        //  :tell は一問一答時に付与する
        //  :ask は返答があることを期待するときに付与する
        this.emit(':ask', greet);
    },
    // 以下は触らなくていいです。
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

//
// 時間によって変わる挨拶を関数化
// 早朝: 5~6時台 　　「朝早いですね、おはようございます。」
// 朝：  7~11時台　　「おはようございます。」
// 昼:   12～18時台  「こんににちは」
// 夜:   19~0時台    「こんばんわ」
// 深夜: 1~4時台     「夜遅くにこんばんわ」
//
// 注意) AWS のLambda のTimezoneを Asia/Tokyo に変更する場合は
//      https://qiita.com/nullian/items/39ecf1f6d0194b72e8e6
//      環境変数の設定で以下を設定する。
//      key: TZ, Value: Asia/Tokyo
function getGreeting(){
    // AWS LambdaのTZの修正を実施したのでここのコードはもとに戻す。
    // var dt = new Date();
    // なんかLambdaの時刻がずれているので修正する
    var timezoneoffset = -9;
    var fakeUTC = new Date(Date.now() - (timezoneoffset * 60 - new Date().getTimezoneOffset()) * 60000);
    var hours = fakeUTC.getHours();
    var greet = undefined;
    if(5 <= hours && hours <= 6){
        // 早朝
        greet = "朝早いですね、おはようございます。アレクサスキルゼミの参加者のみなさん";
    }else if(7 <= hours && hours <= 11){
        greet = "おはようございます,アレクサスキルゼミの参加者のみなさん。";
    }else if(12 <= hours && hours <= 18){
        greet = "こんにちは,アレクサスキルゼミの参加者のみなさん";
    }else if(19 <= hours && hours <= 0){
        greet = "こんばんわ,アレクサスキルゼミの参加者のみなさん";
    }else{
        greet = "夜遅くにこんばんわ,アレクサスキルゼミの参加者のみなさん";
    }
    return greet;
}
