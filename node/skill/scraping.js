// 
//【scraping】
// 
// 概要: WebからHTMLを取得して情報を取得する関数
//      スクレイピンモジュールとしてcheerio-httpcliを利用
//      スクレイピン関数は個別のサービス毎に定義されており、それぞれ
//      関数の帰り値は
//      [日付, イベントタイトル, 詳細情報]
//      $ npm install --save cheerio-httpcli
//
// 更新履歴:
//         2018.06.30 新規作成
//
var client = require('cheerio-httpcli');
client.set('browser','chrome');

// 定数定義
const MAX_TITLE_LEN = 128;
const MAX_BODY_LEN = 512;

loft_asagaya("http://www.loft-prj.co.jp/schedule/lofta")

function fetch(){
}

// URL毎の個別のスクレイピン関数
// 阿佐ヶ谷ロフト
// TOP:   http://www.loft-prj.co.jp/lofta/
// EVENT: http://www.loft-prj.co.jp/schedule/lofta
function loft_asagaya(url){
    var ary = [];
    client.fetch(url, {}, function(err, $, res, body){
        var day = undefined;
        var title = undefined;
        var body = undefined;
        // 表構造になっている
        // [日付,イベント名,イベント詳細] を配列に詰める
        // 開催の日付
        $('th[class=day]').each(function(){
            day = $(this).text();
        }),
        // イベント名
        $('div[class="event clearfix program1"] h3').each(function(){
            title = $(this).text();
        }),
        // イベント詳細
        $('p[class="month_content"] h3').each(function(){
            body = $(this).text();
        }),
        console.log(day);
        ary.push([day, title, body]);
    });
    console.log(ary);
}
function loft_plusone(){
}