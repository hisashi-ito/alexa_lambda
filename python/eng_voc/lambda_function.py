#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# 【英単語発音教室】
#
#  session_atrributeの説明は以下の説明がよい。どこのdictに入っているのか明確に説明されている。
#  https://qiita.com/Tanasho0928/items/23103cc503c0d7d2e719
#
#　更新履歴:
#          2018.07.22 新規作成
import os
import sys
import random
import copy
sys.path.append('./')
# "えいたん" のセリフ
WELLCOME_MSG = "えいたん スキルへようこそ、このスキルでは英単語の発音が正しいかを判定することでできます。英単語の発音練習を初めますか？ \
練習を初める場合は「練習を開始」とおっしゃってください。"
HELP_MSG     = "英単語の学習を始める場合は「発音練習をはじめる」言ってください。本スキルを終了したいときは「終了」と言ってください。"
REPROMPT_MSG = "よく聞こえませんでした。もう一度お願いします"
BYBY_MSG     = "ご利用ありがとうございました。えいたん スキルを終了します。"

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

'''
英単語保存用クラス
'''
class EngVoc(object):
    voc = []
    def __init__(self):
        self._load_voc()

    def _load_voc(self):
        # 指定された英単語ファイルを読み込んでクラス変数に登録する。
        # 読み込むファイル名は固定です。
        f = open("./voc/eng_voc.csv", "r")
        for line in f:
            elems = line.rstrip().split(',')
            # alexa スキルのslotと同じものを利用する。そのために
            # 語彙,IDの順番に記載されている。vocはクラス変数
            EngVoc.voc.append(elems[0])
        f.close()

# スキル起動時の発話
def welcome():
    return QuestionSpeech(WELLCOME_MSG).reprompt(REPROMPT_MSG).build()

# 英語単語学習の開始時の発話すでに出題した単語などの情報をsession_attributesに保存されている
# 引数に msg を追加した。msg は呼び出しもとから
# 「正解です次は〜」みたいな継続情報を上から入れたい！
def lesson(session_attributes, eng_voc, msg = ""):
    tested = session_attributes.get("tested",{})
    # 語彙リストの中からランダムに情報を取得する
    v = ""
    while True:
        v = random.choice(eng_voc.voc)
        if not v in tested:
            break
    tested[v] = 1
    session_attributes["tested"] = copy.deepcopy(tested)
    session_attributes["test"]   = v
    # session_attributesに対話状態をもたせておく今は、テスト中
    session_attributes["status"] = "try"
    # 文字列を生成して発話を促すその場合に
    # テスト済みの単語を session_attributes　に保存しておく
    if len(msg) == 0:
        msg = v + " と発話してください。"
    else:
        msg = msg + " 次は" + v + " と発話してください。"       
    return QuestionSpeech(msg, session_attributes).build()

# 正解かどうかの判定
def voc_recognition(voc, session_attributes):
    if session_attributes["test"] == voc:
        session_attributes["status"] = "next"
        msg = "グッド！　うまく認識できました。"
        lesson(session_attributes, eng_voc):
    else:
        msg = "バッド! うまく認識できませんでした。もう一度、発話してください"
        session_attributes["status"] = "next"
    return QuestionSpeech(msg, session_attributes).build()

# スキル終了時の発話
def bye():
    return OneSpeech(BYBY_MSG).build()

# Lambdaのmain関数
# この関数配下に記載する
def lambda_handler(event, context):
    # 環境変数経由でAPP_ID を取得し、APP_IDが異なる場合は処理を終了
    app_id = os.environ['APP_ID']
    if event['session']['application']['applicationId'] != app_id:
        raise ValueError("Invalid Application ID")

    # 語彙用のクラス
    # AWS lambda関数ではキャッシュされる
    # http://blog.father.gedow.net/2015/12/10/aws-lambda-python-class-variable/
    eng_voc = EngVoc()

    # event 情報の取得
    request = event["request"]
    request_type = request["type"]
    session = event['session']
    session_attributes = session.get('attributes', {})

    # LaunchRequestは、特定のインテントを提供することなく、ユーザーがスキルを呼び出すときに送信される...
    # つまり、「アレクサ、ハローワールドを開いて」のようなメッセージ
    # 「アレクサ、ハローワールドで挨拶しろ」と言うとこれはインテントを含むので、IntentRequestになる
    if request_type == "LaunchRequest":
        # えいたん スキルへようこそ、このスキルでは英単語の発音が正し・・・
        return welcome()

    # 何らかのインテントだった場合が検出された場合
    elif request_type == "IntentRequest":
        intent_name = request["intent"]["name"]

        # 練習開始
        if intent_name == "LessonStartIntent":
            # 練習開始! (msgは空文字で実行)
            session_attributes["status"] = "try"
            return lesson(session_attributes, eng_voc, msg="")

        # 認識処理
        elif intent_name == "EngVocRecIntent":
            # slot に voc が存在する場合はあっているか確認する。
            voc = request["intent"]["slots"]["EngVoc"]
            return voc_recognition(voc, session_attributes)


        elif intent_name == "NextIntent":
            return lesson(session_attributes, eng_voc)
        # amazon が提供する組み込みインテント（ヘルプ）
        # 「ヘルプ」「どうすればいいの」「使い方を教えて」で呼ばれる、組み込みインテント        
        elif intent_name == 'AMAZON.HelpIntent':
            return welcome()
        # amazon が提供する組み込みインテント（キャンセル、ストップ）
        # 「キャンセル」「取り消し」「やっぱりやめる」等で呼び出される。組み込みのインテント
        elif intent_name == 'AMAZON.CancelIntent' or intent_name == 'AMAZON.StopIntent' or intent_name == 'AMAZON.NoIntent':
            return bye()

if __name__ == '__main__' :
    import json
    request = {
        "type": "LaunchRequest"
    }
    event = {
        "request": request,
        "session": {"application":{"applicationId": os.environ['APP_ID']}}
    }
    print(lambda_handler(event, {}))
