DOCSRC = $(shell find docs -name '*.md')
DOCTRG = $(DOCSRC:.md=.html)


.PHONY: cleandocs docs


docs: $(DOCTRG)

cleandocs:
	rm -f $(DOCTRG)

%.html: %.md
	@echo "... $< -> $@"
	@markdown $< \
	  | cat docs/layout/head.html - docs/layout/foot.html \
	  > $@
