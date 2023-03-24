node ./android/syncdata.js

scp ./*.js termux:"/data/data/com.termux/files/home/dlink_node"
scp ./*.txt termux:"/data/data/com.termux/files/home/dlink_node"
scp ./*.json termux:"/data/data/com.termux/files/home/dlink_node"
scp -r ./Scripts termux:"/data/data/com.termux/files/home/dlink_node"
scp ./android/data.js termux:"/data/data/com.termux/files/home/dlink_node/Scripts"

