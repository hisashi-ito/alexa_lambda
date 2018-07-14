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
#         2018.07.14 実装を完了
#
import sys
import re
import requests
sys.path.append('./')
#import mojimoji
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

# 定数定義
MAX_TITLE_LEN = 128
# MAX_BODY_LEN = 512

# 記事判定用のキーワード集(メンテナンス必要)
KEYWORDS = [
    "アニメ","漫画","まんが",
    "anime","新番組",
    "声優","せいゆう",
    "作画","二次元","にじげん",
    "プロデューサー","bd-box",
    "ブルーレイ","blue-ray",
    "blue","dvd",
    "発売記念","イラスト","絵師"
]
# NGデータ
NG_KEYWORDS = ["エロ","18禁","sex","アダルト"]

# 最大個数
MAX_EVENT_NUM = 2

# スクレイピングクラス
class Scraping(object):
    def __init__(self, urls):
        # user agentを偽装するためのインスタンス
        ua = UserAgent()
        self.header = {'User-Agent':str(ua.chrome)}
        # 取得するデータのurlを配列で保存する
        self.urls = urls

    def __call__(self):
        # 各イベント毎に処理する
        ret = {}
        # 設定させているURLでループを回すc
        for site, url in self.urls.items():
            html = self._getHtml(url)
            # URLの種別で呼び出すパーサを変更する
            if site == "阿佐ヶ谷ロフト" or site == "ロフトプラスワン":
                # HTMLをparseする
                ret[site] = self._loft(html)
        return ret

    # 文字列正規化
    # 改行コードを削除して、英語を小文字化する
    def _normalize(self, text):
        # 不要な文字列をきれいに削除
        text = text.strip()
        text = re.sub(r'\'|\"',"", text)
        text = re.sub("\r?\n","", text)
        text = re.sub("　"," ", text)
        text = re.sub(r'【|】|[|]|「|」|『|』',"", text)
        text = re.sub(r'：'," ", text)
        text = text.replace(u'\xa0', ' ')
        text = text.lower()
        return text
    
    # トリミング
    # タイトルが指定された文字数以上の場合は
    # 3文字削除して三点リーダー(...)とする
    def _trim(self, text):
        if len(text) >= (MAX_TITLE_LEN - 3):
            text = text[0:MAX_TITLE_LEN - 3] + "..."
        return text

    # イベント判定
    # NGキーワードに該当したらFalseを返却
    # 目的のイベントにマッチすれがTrueを返却する
    def _isAnime(self, text):
        for kw in NG_KEYWORDS:
            pat = re.compile(r'{}'.format(kw))
            if re.search(pat, text):
                return False
        for kw in KEYWORDS:
            pat = re.compile(r'{}'.format(kw))
            if re.search(pat, text):
                return True
        return False
                
    # HTMLを取得する
    def _getHtml(self,url):
        response = requests.get(url, headers=self.header)
        response.encoding = response.apparent_encoding
        return response
        s
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
            # 月/日の表現を置換する
            day = re.sub(r'\/',"月", day) + '日'
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
            # 指定されたイベント数が確保できたら処理を停止
            if len(event) >= MAX_EVENT_NUM:
                return event
            # イベントor NG 判定を実施する
            if self._isAnime(bodies[i]) or self._isAnime(titles[i]):
                # タイトル情報だけトリミングする。
                event.append([days[i], self._trim(titles[i]), bodies[i]])
        return event

# 動作確認
if __name__ == '__main__' :
    # URL定義
    TARG_URLS = {
        # keyがイベントの実親場所
        "阿佐ヶ谷ロフト": "http://www.loft-prj.co.jp/schedule/lofta",
        "ロフトプラスワン": "http://www.loft-prj.co.jp/schedule/plusone"
    }
    s = Scraping(TARG_URLS)()
    print(s)
