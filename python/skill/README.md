### pip のlib のinstall方法
基本的にAWS lambda関数で実行するためにライブラリなどは作業ディレクトリ直下にインストールする。 
* mojimoji
```
pip3 install mojimoji -t ./
```
文字列の正規化のためにインストールします。  
* beautifulsoup4
```
pip3 install beautifulsoup4 -t ./
```
pythonでHTMLのDOMを解析するために利用します。主に、スクレイピングとして利用します。  
* requests
```
$ pip3 install requests -t ./
```
HTTPリクエストライブラリ(htmlを取得します)  
* lxml
```
$ pip3 install lxml -t ./
```
HTMLパーサです。
* fake-useragent
```
$ pip3 install fake-useragent
```
代表的なユーザエージェントを偽装するためのライブラリです。