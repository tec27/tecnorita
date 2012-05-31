test:
	NODE_PATH=$(NODE_PATH):$(CURDIR)/lib $(CURDIR)/node_modules/mocha/bin/mocha -R spec test/*.test.js

.PHONY: test
