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
//      只今サポートしているWEBは
//      - 阿佐ヶ谷ロフト:   
//        http://www.loft-prj.co.jp/schedule/lofta
//      - ロフトプラスワン:
//        http://www.loft-prj.co.jp/schedule/plusone
//
// 更新履歴:
//         2018.06.30 新規作成
//
var client = require('cheerio-httpcli');
client.set('browser','chrome');

// 定数定義
const MAX_TITLE_LEN = 128;
const MAX_BODY_LEN = 512;

/*
loft_asagaya("http://www.loft-prj.co.jp/schedule/lofta").then(function(ret){
    //console.log(ret);
  }
);
loft_asagaya("http://www.loft-prj.co.jp/schedule/plusone").then(function(ret){
    console.log(ret);
  }
);
*/

// URL毎の個別のスクレイピン関数
// ロフトWEB
function loft(url){
    // 時刻情報の取得
    var utime = new Date().getTime();
    return new Promise(function(resolve){
        var daies = [];
        var titles = [];
        var bodies = [];
        var ret = [];
        client.fetch(url, {}, function(err, $, res, body){
            // 表構造になっている
            // [日付,イベント名,イベント詳細] を配列に詰める
            // 開催の日付
            $('th[class=day]').each(function(){
                day = $(this).text();
                var reg = day.match(/(\d+)\/(\d+)/);
                // 取得できるのいは月,日だけなので年の情報を付与する
                // パタンが保存されているのでは index 番号が1から
                day = "2018-" + Number(reg[1]) + "-" + Number(reg[2]);
                daies.push(day);
            })
            // イベント名
            $('div[class="event clearfix program1"] h3').each(function(){
                title = $(this).text();
                title = title.replace(/\r?\n/g,"");
                if(title.length >= MAX_TITLE_LEN-3){
                    title.substr(0,MAX_TITLE_LEN) + '...'
                }
                titles.push(title);
            })
            // イベント詳細
            $('p[class="month_content"]').each(function(){
                body = $(this).text();
                body = body.replace(/\r?\n/g,"");
                if(body.length >= MAX_BODY_LEN){
                    body.substr(0,MAX_BODY_LEN) + '...'
                }
                bodies.push(body);
            })
            for(var i = 0; i < daies.length; i++){
                // 記載のイベントが現在時刻よりも過去の場合保存配列に入れない。
                var event_utime = new Date(daies[i]).getTime();           
                if(event_utime < utime){
                    continue;
                }
                ret.push([daies[i], titles[i], bodies[i]]);
            }
            resolve(ret);
        })
    });
} 
