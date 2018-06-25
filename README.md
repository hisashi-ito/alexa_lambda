## Alexa のための AWS Lambda 関数例

<p align="center">
<img src="https://user-images.githubusercontent.com/8604827/41828997-42924ad8-7873-11e8-9e10-3e4bb5f856c7.png" width="400px">
</p>
Alexaのシステムのために利用するAWSのLambda関数の例を示します。例として提供するのは以下の種別です  

#### 実装するLambda
時間に合わせて異なる挨拶を返答する。  
例)  
▼起動時  
「挨拶を聞きたいときは「挨拶の言葉をお願いします」,終わりたいときは「おしまい」と言ってください。どうしますか？」  
▼あいさつ（時間に合わせて）
1. 「朝早いですね、おはようございます。アレクサスキルゼミの参加者のみなさん」(早朝)  
1. 「おはようございます,アレクサスキルゼミの参加者のみなさん。」(朝)  
1. 「こんにちは,アレクサスキルゼミの参加者のみなさん」 (昼)  
1. 「こんばんわ,アレクサスキルゼミの参加者のみなさん」 (夜)  
1. 「夜遅くにこんばんわ,アレクサスキルゼミの参加者のみなさん」 (深夜)  

#### サンプルコード
1. node.js (ASK SDK v1)
node.js を利用したASK SDK version 1 におけるサンプル。
1. node.js (ASK SDK v2)
node.js を利用したASK SDK version 2におけるサンプル。
1. Python3
python3による
