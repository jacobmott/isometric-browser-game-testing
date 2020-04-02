
#This file needs to be run where convert command is available, I had to install cygwin on windows and make sure to select
#imagemagick from the packages.
#https://www.imagemagick.org/discourse-server/viewtopic.php?t=15523
#http://www.imagemagick.org/script/command-line-options.php#append

convert crusader_walk_70014.png crusader_walk_70013.png crusader_walk_70014.png crusader_walk_70013.png crusader_walk_70012.png crusader_walk_70011.png crusader_walk_70010.png crusader_walk_70009.png crusader_walk_70008.png crusader_walk_70007.png +append combined13.png 

convert crusader_walk_70006.png crusader_walk_70005.png crusader_walk_70004.png crusader_walk_70003.png crusader_walk_70002.png crusader_walk_70001.png crusader_walk_70000.png crusader_walk_60014.png crusader_walk_60013.png crusader_walk_60012.png +append combined12.png 

convert crusader_walk_60011.png crusader_walk_60010.png crusader_walk_60009.png crusader_walk_60008.png crusader_walk_60007.png crusader_walk_60006.png crusader_walk_60005.png crusader_walk_60004.png crusader_walk_60003.png crusader_walk_60002.png +append combined11.png 

convert crusader_walk_60001.png crusader_walk_60000.png crusader_walk_50014.png crusader_walk_50013.png crusader_walk_50012.png crusader_walk_50011.png crusader_walk_50010.png crusader_walk_50009.png crusader_walk_50008.png crusader_walk_50007.png +append combined10.png 

convert crusader_walk_50006.png crusader_walk_50005.png crusader_walk_50004.png crusader_walk_50003.png crusader_walk_50002.png crusader_walk_50001.png crusader_walk_50000.png crusader_walk_40014.png crusader_walk_40013.png crusader_walk_40012.png +append combined9.png 

convert crusader_walk_40011.png crusader_walk_40010.png crusader_walk_40009.png crusader_walk_40008.png crusader_walk_40007.png crusader_walk_40006.png crusader_walk_40005.png crusader_walk_40004.png crusader_walk_40003.png crusader_walk_40002.png +append combined8.png 

convert crusader_walk_40001.png crusader_walk_40000.png crusader_walk_30014.png crusader_walk_30013.png crusader_walk_30012.png crusader_walk_30011.png crusader_walk_30010.png crusader_walk_30009.png crusader_walk_30008.png crusader_walk_30007.png +append combined7.png 

convert crusader_walk_30006.png crusader_walk_30005.png crusader_walk_30004.png crusader_walk_30003.png crusader_walk_30002.png crusader_walk_30001.png crusader_walk_30000.png crusader_walk_20014.png crusader_walk_20013.png crusader_walk_20012.png +append combined6.png 

convert crusader_walk_20011.png crusader_walk_20010.png crusader_walk_20009.png crusader_walk_20008.png crusader_walk_20007.png crusader_walk_20006.png crusader_walk_20005.png crusader_walk_20004.png crusader_walk_20003.png crusader_walk_20002.png +append combined5.png 

convert crusader_walk_20001.png crusader_walk_20000.png crusader_walk_10014.png crusader_walk_10013.png crusader_walk_10012.png crusader_walk_10011.png crusader_walk_10010.png crusader_walk_10009.png crusader_walk_10008.png crusader_walk_10007.png +append combined4.png 

convert crusader_walk_10006.png crusader_walk_10005.png crusader_walk_10004.png crusader_walk_10003.png crusader_walk_10002.png crusader_walk_10001.png crusader_walk_10000.png crusader_walk_00014.png crusader_walk_00013.png crusader_walk_00012.png +append combined3.png 

convert crusader_walk_00011.png crusader_walk_00010.png crusader_walk_00009.png crusader_walk_00008.png crusader_walk_00007.png crusader_walk_00006.png crusader_walk_00005.png crusader_walk_00004.png crusader_walk_00003.png crusader_walk_00002.png +append combined2.png 

convert crusader_walk_00001.png crusader_walk_00000.png +append combined1.png 


convert combined1.png combined2.png combined3.png combined4.png combined5.png combined6.png combined7.png combined8.png combined9.png combined10.png combined11.png combined12.png combined13.png -append combined.png