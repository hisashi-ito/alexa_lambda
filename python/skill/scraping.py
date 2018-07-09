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
sys.path.append('.')
import mojimoji
from bs4 import BeautifulSoup

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
NG_KEYWORDS = [
    "エロ","18禁","sex","アダルト"
]

'''
スクレイピングクラス
'''
class Scraping(object):
    def __init__(self, urls):
        # 取得するデータのurlを配列で保存する
        self.urls = urls

    def perform(self):
        pass

    # HTMLを取得する
    def getHtml(self,url):
        # 

    def loft(self):
        #     


    

