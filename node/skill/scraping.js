// 
//【scraping】
// 
// 概要: WebからHTMLを取得して情報を取得する関数
//      スクレイピンモジュールとしてcheerio-httpcliを利用
//      スクレイピン関数は個別のサービス毎に定義されており、それぞれ
//      関数の帰り値は
//      [日付, イベントタイトル, 詳細情報]
//      $ npm install --save cheerio-httpcli
//      $ npm install --save moji
//        https://www.npmjs.com/package/moji
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
var moji = require('moji');
const async = require('async');
client.set('browser','chrome');

// 定数定義
const MAX_TITLE_LEN = 128;
const MAX_BODY_LEN = 512;
// 記事判定用のキーワード集(メンテナンス必要)
const KEYWORDS = [
    "アニメ","漫画","まんが",
    "anime","新番組","監督",
    "声優","せいゆう","アニメータ",
    "作画","二次元","にじげん",
    "プロデューサー","bd-box",
    "ブルーレイ","blue-ray","box",
    "blue","blueray","dvd",
    "発売記念","イラスト","絵師"
];
// NGワード
const NG_KEYWORDS = [
    "エロ","18禁","sex","アダルト"
];

/*
loft("http://www.loft-prj.co.jp/schedule/lofta").then(function(ret){
    console.log(ret);
  }
);
loft("http://www.loft-prj.co.jp/schedule/plusone").then(function(ret){
    console.log(ret);
  }
);
*/

event_search();

// イベント抽出
function event_search(){
    var event = {};
    async.series([
        function(callback){
            loft("http://www.loft-prj.co.jp/schedule/lofta").then(function(ret){
                console.log("1");
                event["阿佐ヶ谷ロフト"] = JSON.parse(JSON.stringify(ret));
            })
        },
        function(callback){
            console.log("2");
            loft("http://www.loft-prj.co.jp/schedule/plusone").then(function(ret){
                event["ロフトプラスワン"] = JSON.parse(JSON.stringify(ret));
            })
        }
    ],
    function complete(err, results){
        console.log("3");
        return event;
    });
}
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
                title = title.replace(/\r?\n/g,"").toLowerCase();
                // 文字列の正規化
                title = moji(title).convert('ZE', 'HE').convert('ZS', 'HS').convert('HK', 'ZK').toString();
                if(title.length >= MAX_TITLE_LEN-3){
                    title.substr(0,MAX_TITLE_LEN) + '...'
                }
                titles.push(title);
            })
            // イベント詳細
            $('p[class="month_content"]').each(function(){
                body = $(this).text();
                body = body.replace(/\r?\n/g,"").toLowerCase();
                // 文字列の正規化
                body = moji(body).convert('ZE', 'HE').convert('ZS', 'HS').convert('HK', 'ZK').toString();
                if(body.length >= MAX_BODY_LEN){
                    body.substr(0,MAX_BODY_LEN) + '...'
                }
                bodies.push(body);
            })

            //　event情報フィルタ
            for(var i = 0; i < daies.length; i++){
                // 1) 開催日フィルタ(取得時よりも古いeventは表示しない)
               var event_utime = new Date(daies[i]).getTime();           
                if(event_utime < utime){
                    continue;
                }
                // 2) ジャンル判定(アニメ関連か？)
                for(var j = 0; j < KEYWORDS.length; j++){
                    kw = KEYWORDS[j];
                    // 正規表現でマッチングする(遅いけどまーこのレコード数ならいいだろ)
                    var regexp = new RegExp(kw);
                    if(titles[i].match(regexp) || bodies[i].match(regexp)){
                        // 適合イベントに対してNG_KEYWORDで最後に確認する
                        for(var k = 0; k < NG_KEYWORDS.length; k++){
                            ng_kw = NG_KEYWORDS[k];
                            var ng_regexp = new RegExp(ng_kw);
                            if (titles[i].match(ng_regexp) || bodies[i].match(ng_regexp)){
                                // NGに適合したらイベントとして採用しない
                                break;
                            }
                        }
                        // イベント名,イベント詳細のどちらかに指定してキーワードが存在したらKWループをbreakする
                        ret.push([daies[i], titles[i], bodies[i]]);
                        break;
                    }
                }
            }
            resolve(ret);
        })
    });
} 
