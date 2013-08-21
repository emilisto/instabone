all:
	@echo 'If you want to build the browser module, run `make browser`. For node, run `make node`.'
node:
	@echo 'Make me!'
browser:
	@npm install -g grunt-cli
	@npm install
	@tools/generate-certs.sh
	@echo
	@echo 'All dependencies installed, do `grunt build` to create build/instabone.js'
	@echo
