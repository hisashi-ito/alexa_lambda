### Alexa SDK version1 の利用法
Alexa SDK version1を利用したAWS lambda 関数の設定方法
1. 本ディレクトリをzip 圧縮する
```
$ zip -r ../ask-sdk_1.zip *
```
1. AWS lambda 関数にzip圧縮したファイルを登録する

#### node.js でライブラリを利用する場合の方法
Alexa のSDKはAWSのlambda上に登録されているのだが、その他のnode.jsのライブラリは事前にこちで用意しておく必要がある。今回利用したask-sdk-v1adapter　に関しても基本的にはlambdaにはインストールされていないのでこちらでインストールする必要があるのでインストール方法と設定方法について記載する。  

(1) npm 初期化
ライブラリは npm (Node Package Manager)を利用したローカルにライブラリをダウントールします。
```
$ npm init
```
★対話的にライブラリの名称等を聞かれるので入力する。作成すると package.json が生成される。

(2) ライブラリのインストール
今回は以下の３つをインストールしておく
・alexa-sdk (いらないかも)
```
$ npm install --save alexa-sdk
```
・ask-sdk
```
$ npm install --save ask-sdk
```
・ask-sdk-v1adapter
```
$ npm install ask-sdk-v1adapter
```
★インストールすると実行したディレクトリに　node_modules/ ディレクトリが生成されインストールされる。

(3) アーカイブを圧縮する
lambda にインストールするために圧縮する
```
$ zip -r ../ask-sdk1.zip *
```
