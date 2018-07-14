#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# AnimeTalkEvent Skill Lambda Function
import sys
sys.path.append('./')
from scraping import Scraping
import boto3
import datetime

# セリフ一覧
WELLCOME_MSG = "アニメトークイベントお知らせスキルへようこそ。\
このスキルではアニメトークイベントをチェックできます。\
予定されているアニメトークイベントを知りたいですか？　知りたい場合は「はい」と言ってください。"
HELP_MSG = "アニメトークイベント情報を知りたい場合は、\
「イベント情報教えて」、本スキルを終了したいときは「終了」と言ってください。"
REPROMPT_MSG = "よく聞こえませんでした。イベント情報を知りたいですか？知りたい場合は「はい」と言ってください'"
BYBY_MSG = "ご利用ありがとうございました。スキルを終了します。"

# URL定義
TARG_URLS = {
    # keyがイベントの実親場所
    "阿佐ヶ谷ロフト": "http://www.loft-prj.co.jp/schedule/lofta",
    "ロフトプラスワン": "http://www.loft-prj.co.jp/schedule/plusone",
}

class BaseSpeech:
    '''
    constructor
    arguments:
    speech_text: Alexaに喋らせたいテキスト
    should_end_session: このやり取りでスキルを終了させる場合はTrue, 続けるならFalse
    session_attributes: 同一セッション内での永続化情報(セッションが終わると廃棄される)
    '''
    def __init__(self, speech_text, should_end_session, session_attributes=None):
        # セションアトリビュートの初期化
        if session_attributes is None:
            session_attributes = {}

        # 最終的に返却するレスポンス内容。(dict)
        # 各メソッドで上書き・修正していく(結構乱暴な実装というか、ライブラリが提供されていない)
        self._response = {
            "version": "1.0",
            "sessionAttributes": session_attributes,
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": speech_text
                },
                "shouldEndSession": should_end_session
            },
        } 

        # インスタンス変数に一時変数を用意しておく
        self.speech_text = speech_text
        self.should_end_session = should_end_session
        self.session_attributes = session_attributes

    def simple_card(self, title, text=None):
        if text is None:
            text = self.speech_text
        card = {
            # シンプルカードを追加
            "type": "Simple",
            "title": title,
            "content": text
        }
        # レスポインスハッシュに追加
        self._response['response']['card'] = card
        return self

    def build(self):
        # 発話を実施するときに最後にこの関数をcallする
        return self._response
'''
OnSpeech
一問一解に利用する。
システムは返答をするだけで、ユーザの応答を待たない
'''
class OneSpeech(BaseSpeech):
    def __init__(self, speech_text, session_attributes=None):
        # speech_text と should_end_session = Trueを渡して終了
        super().__init__(speech_text, True, session_attributes)

'''
QestionSpeech
発話してユーザの返事を待ちます
'''
class QuestionSpeech(BaseSpeech):
    def __init__(self, speech_text, session_attributes=None):
        # 会話を継続するので、should_end_sessionを False に設定しておく
        super().__init__(speech_text, False, session_attributes)
 
    def reprompt(self, text):
        """リプロンプトを追加する"""
        reprompt = {
            "outputSpeech": {
                "type": "PlainText",
                "text": text
            }
        }
        self._response["response"]["reprompt"] = reprompt
        return self

# スキル起動時
def welcome():
    return QuestionSpeech(WELLCOME_MSG).reprompt(REPROMPT_MSG).build()

# スキル終了時
def bye():
    return OneSpeech(BYBY_MSG).build()

# イベント情報取得
def getInfos():
    return Scraping(TARG_URLS)()

# 返却文字列を作成
def speak(infos):
    msg = ""
    for site, events in infos.items():
        msg += site + "の情報についてお知らせします。"
        for event in events:
            day = event[0]
            title = event[1]
            msg += (day + " " + title)
        msg += "\n"
    return OneSpeech(msg).build()

# Lambdaのmain関数
def lambda_handler(event, context):
    # リクエストの種類を取得
    request = event["request"]
    request_type = request["type"]

    # LaunchRequestは、特定のインテントを提供することなく、ユーザーがスキルを呼び出すときに送信される...
    # つまり、「アレクサ、ハローワールドを開いて」のようなメッセージ
    # 「アレクサ、ハローワールドで挨拶しろ」と言うとこれはインテントを含むので、IntentRequestになる
    if request_type == "LaunchRequest":
        return welcome()
    # 何らかのインテントだった場合が検出された場合
    elif request_type == "IntentRequest":
        intent_name = request["intent"]["name"]
        if intent_name == 'AMAZON.YesIntent':
            return speak(getInfos())
        # amazon が提供する組み込みインテント（ヘルプ）
        # 「ヘルプ」「どうすればいいの」「使い方を教えて」で呼ばれる、組み込みインテント        
        elif intent_name == 'AMAZON.HelpIntent':
            return welcome()
        # amazon が提供する組み込みインテント（キャンセル、ストップ）
        # 「キャンセル」「取り消し」「やっぱりやめる」等で呼び出される。組み込みのインテント
        elif intent_name == 'AMAZON.CancelIntent' or intent_name == 'AMAZON.StopIntent':
            return bye()

if __name__ == '__main__' :
    import json
    request = {
        "type": "IntentRequest",
        "intent": {"name": 'AMAZON.YesIntent'}
    }
    event = {"request": request}
    res = lambda_handler(event, {})
    print(res)
