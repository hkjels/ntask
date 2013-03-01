

# Paths

BIN = node_modules/.bin


test:
	@$(BIN)/mocha --growl --reporter 'dot' --require should ./test/*.test.js

docs: Readme.md

clean:
	rm -f $(DOCTRG)


Readme.md: docs/*.md
	@cat $^ > $@


.PHONY: test docs clean
