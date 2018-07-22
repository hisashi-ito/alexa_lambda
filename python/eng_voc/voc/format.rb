#! /usr/bin/ruby
# -*- coding: utf-8 -*-
cnt = 1
while line = gets
  voc = line.chomp.encode("utf-8").gsub("\r?\n","")
  next if voc.to_s.empty?
  next if voc =~ (/\[(.+)\]$/)
  # 半角スペースが含まれているとだめである
  next if voc =~ (/\s/)
  # 文字列長が1の場合は入れない
  next if voc.chars.to_a.size <= 1
  # VOC,ID
  puts "#{voc},#{cnt}"
  cnt += 1
end
