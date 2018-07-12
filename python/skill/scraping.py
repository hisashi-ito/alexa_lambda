#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# 概要: WebからHTMLを取得して情報を取得する関数
#      スクレイピンモジュールとしてcheerio-httpcliを利用
#      スクレイピン関数は個別のサービス毎に定義されており、それぞれ
#      関数の帰り値は
#      [日付, イベントタイトル, 詳細情報]
#
#      只今サポートしているWEBは
#      - 阿佐ヶ谷ロフト:   
#        http://www.loft-prj.co.jp/schedule/lofta
#      - ロフトプラスワン:
#        http://www.loft-prj.co.jp/schedule/plusone
#
# 更新履歴:
#         2018.07.09 node版からpython版へ移植した
#
import sys
import re
import requests
sys.path.append('.')
import mojimoji
from bs4 import BeautifulSoup
import lxml.html
from fake_useragent import UserAgent

# 定数定義
MAX_TITLE_LEN = 128
MAX_BODY_LEN = 512

# 記事判定用のキーワード集(メンテナンス必要)
KEYWORDS = [
    "アニメ","漫画","まんが",
    "anime","新番組","監督",
    "声優","せいゆう","アニメータ",
    "作画","二次元","にじげん",
    "プロデューサー","bd-box",
    "ブルーレイ","blue-ray","box",
    "blue","blueray","dvd",
    "発売記念","イラスト","絵師"
]
# NGデータ
NG_KEYWORDS = ["エロ","18禁","sex","アダルト"]

# URL定義
TARG_URLS = {
    "ASAGAYA_LOFTT": "http://www.loft-prj.co.jp/schedule/lofta",
    "LOFT_PLUS1": "http://www.loft-prj.co.jp/schedule/plusone",
}

# スクレイピングクラス
class Scraping(object):
    def __init__(self, urls):
        # user agentを偽装するためのインスタンス
        ua = UserAgent()
        self.header = {'User-Agent':str(ua.chrome)}
        # 取得するデータのurlを配列で保存する
        self.urls = urls

    def perform(self):
        ret = []
        # 設定させているURLでループを回す
        for site, url in self.urls.items():
            html = self._getHtml(url)
            # URLの種別で呼び出すパーサを変更する
            if site == "ASAGAYA_LOFTT" or site == "LOFT_PLUS1":
                # HTMLをparseする
                ret.extend(self._loft(html))
        return ret

    # 文字列正規化
    # 改行コードを削除して、英語を小文字化する
    def _normalize(self, text):
        # 改行を削除
        text = re.sub("\r?\n","", text)
        text = text.lower()
        return text

    # HTMLを取得する
    def _getHtml(self,url):
        return requests.get(url, headers=self.header)
        
    def _loft(self, html):
        days = []
        titles = []
        bodies = []
        soup = BeautifulSoup(html.content, "html.parser")
        # 日付情報を取得する
        for a in soup.find_all("th", attrs={"class": "day"}):
            day = a.p.text
            if not isinstance(day, str):
                continue
            days.append(self._normalize(day))
        # イベントタイトル
        for a in soup.find_all("div", attrs={"class": "event clearfix program1"}):
            title = a.h3.text
            if not isinstance(title, str):
                continue
            titles.append(self._normalize(title))
        # 本文
        for a in soup.find_all("p", attrs={"class": "month_content"}):
            body = a.text
            if not isinstance(body, str):
                continue
            bodies.append(self._normalize(body))
        # 日付毎にloopしてイベント情報を保存する
        event = []
        for i in range(len(days)):
            event.append([days[i], titles[i], bodies[i]])
        return event

# 動作確認
if __name__ == '__main__' :
    s = Scraping(TARG_URLS).perform()
    print(len(s))
