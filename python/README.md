### Python3 用のAWS　lambda関数
AWS lambda用のpython3のサンプルを作成となります。オリジナルコードはAWSの設計図(alxsa)の中に存在するものであるが、以下のURLに記載されているものを利用させていただいて修正している。  
https://torina.top/detail/441/  

基本的にこのコードをAWSのオンラインコード記載部分に添付することで登録できる。

1. 基本的な動作
lambda関数からは以下のハンドラを通じてレスポンスが送られてくる。  
```
lambda_handler(event, context) 
```
ユーザは上記の event, contenxt 情報から必要な情報を取得し、lambda関数の応答値(BaseSpeech::rescponse)情報を組み立てて返却すればよい。（比較的シンプルな実装）
