.PHONY: all test lint docs clean mocha with cream and sugar


# Paths

BIN = node_modules/.bin
DOCSRC = $(shell find docs -name '*.md')
DOCTRG = $(DOCSRC:.md=.html)


# I love it when 'all' is true

all:
	@true

test:
	@$(BIN)/mocha --growl --reporter 'dot' --require should ./test/*.test.js

lint:
	@$(BIN)/jshint ./lib/*.js

docs: $(DOCTRG)

clean:
	rm -f $(DOCTRG)

%.html: %.md
	@echo "... $< -> $@"
	@markdown $< \
	  | cat docs/layout/head.html - docs/layout/foot.html \
	  > $@


# Aliases

mocha: test

with:
	@true

cream: lint

and:
	@true

sugar: docs
