rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "Compiling project to show at Github website"
git push origin master
