BIN = node_modules/.bin


all: lint test docs

install:
	@rm -Rf node_modules
	@npm link

lint:
	@$(BIN)/jshint ./lib/*.js --config lint.json

test:
	@rm -Rf test/.todo
	@$(BIN)/mocha --growl --reporter 'dot' --require should ./test/*.test.js


.PHONY: install lint test docs