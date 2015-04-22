export ANDROID_HOME="/Users/kjartanjonsson/Library/Android/sdk"
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
python make.py
cd ../../taxigateways/
./build_files.sh