/**
 * Drop 'em
 * Creates custom drop down select lists from a normal select list
 * @dependency underscore.js
 *
 * Created with JetBrains PhpStorm.
 * User: leeowen
 * Date: 30/09/13
 * Time: 16:56
 *
 */
define(['underscore'], function (_) {

    // Please send through valid selector
    var DropEm = (function(selector, callback) {
        "use strict";

        // Config object
        this.config = {

                valid : ['optgroup', 'option']

        };

        /**
         *
         * @param {string} selector
         * @returns {*}
         */
        DropEm.prototype.boSelecta = function(selector) {

            try {
                return Array.prototype.slice.call(

                    document.querySelectorAll( selector ) );

            } catch(e){

                console.log({'Error':e});
            }

        };


        // Constructor
        this.el = DropEm.prototype.boSelecta(selector)[0];

        var self = this;

        this.callback = callback;

        /**
         * Curries the config object to check up on a key: [array]
         * Usage: var fooCheckConfig = checkConfig(configObject, ObjectKey);
         * @param {object} config
         * @param {string} key
         * @returns {Function}
         */
        DropEm.prototype.checkConfig = function(config, key) {

            return function(itemToBeChecked) {

                if(_(itemToBeChecked.isString)) {

                    return _(config[key]).contains(itemToBeChecked);

                } else {

                    throw new Error('Item to be checked must be a string');
                }
            };
        };

        /**
         * Create function to check for valid elements
         * @type {Function}
         */
        DropEm.prototype.validElementCheck = DropEm.prototype.checkConfig(this.config, 'valid');

        /**
         * Cross browser Event Listener
         * Usage: addEvent( document.getElementsByTagName('a'), 'click', fn);
         */
        DropEm.prototype.addEvent = (function () {
            var filter = function(el, type, fn) {
                for ( var i = 0, len = el.length; i < len; i++ ) {
                    DropEm.prototype.addEvent(el[i], type, fn);
                }
            };
            if ( document.addEventListener ) {
                return function (el, type, fn) {
                    if ( el && el.nodeName || el === window ) {
                        el.addEventListener(type, fn, false);
                    } else if (el && el.length) {
                        filter(el, type, fn);
                    }
                };
            }

            return function (el, type, fn) {
                if ( el && el.nodeName || el === window ) {
                    el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
                } else if ( el && el.length ) {
                    filter(el, type, fn);
                }
            };
        })();

        /**
         *
         * @param {object} element
         * @param {string} cls
         * @returns {boolean}
         */
        DropEm.prototype.hasClass = function(element, cls) {

            if(element.classList !== undefined) {

                if(element.classList !== null && element.classList.length > 0) {

                    return element.classList.contains(cls);

                }

            } else {

                return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
            }
        };

        /**
         * Creates a new ul element with li cloned from select options
         * @param {object} element
         */
        DropEm.prototype.createDropdown = function(element) {

            var children = element.children;

            var frag = document.createDocumentFragment();

            var ul = document.createElement('ul');

            ul.className = element.className + ' dropem-list';
            ul.id = 'dropem-list-' + self.el.id;

            // TODO: Refactor to function
            element.getAttribute('value') !== null ? ul.setAttribute('data-type', element.getAttribute('value')) : ul.setAttribute('data-type', 'dropem-el');

            // _.each() ?
            for (var i = 0, l = children.length; i < l; i++) {

                // Do something with each child element as children[i]
                var elName = children[i].nodeName.toLowerCase();

                // e.g.if child name !== OPTGROUP therefore probably an OPTION
                if(self.validElementCheck(elName) && elName !== 'optgroup') {

                    var li = document.createElement('li');

                    children[i].getAttribute('value') !== null ? li.setAttribute('data-type', children[i].getAttribute('value')) : li.setAttribute('data-type', 'dropem-el');

                    li.textContent = children[i].textContent || children[i].innerText; // Get option text

                    li.className = children[i].className + ' dropem-item'; // add class

                    ul.appendChild(li);

                // If it IS an OPTGROUP loop over child OPTIONS
                } else if(self.validElementCheck(elName) && elName === 'optgroup') {

                    if(!self.hasClass(self.el.parentNode, 'multi')) {

                        self.el.parentNode.className += ' multi';

                    }

                    var oli = document.createElement('li');

                    ul.className += ' optgroup';

                    children[i].getAttribute('value') !== null ? oli.setAttribute('data-type', children[i].getAttribute('value')) : oli.setAttribute('data-type', 'dropem-el');

                    children[i].getAttribute('data-type') !== null ? oli.className = children[i].getAttribute('data-type') : oli.className = 'dropem-el';
                    children[i].getAttribute('data-id') !== null ? oli.setAttribute('data-id', children[i].getAttribute('data-id')) : oli.setAttribute('data-id', i + '');

                    oli.textContent = children[i].label;

                    if(i === 1) {

                        var anchor = document.createElement('a');
                        anchor.textContent = 'Deselect all';
                        anchor.className = 'select-anchor';
                        anchor.href = '#1';
                        oli.appendChild(anchor);
                    }

                    var cul = document.createElement('ul');

                    var child = children[i].children;

                    for (var ci = 0, cl = child.length; ci < cl; ci++) {

                        var cli = document.createElement('li');

                        child[ci].getAttribute('value') !== null ? cli.setAttribute('data-type', child[ci].getAttribute('value')) : cli.setAttribute('data-type', 'dropem-el');

                        child[ci].getAttribute('data-id') !== null ? cli.setAttribute('data-id', child[ci].getAttribute('data-id')) : cli.setAttribute('data-id', ci + '');

                        cli.textContent = child[ci].textContent || child[ci].innerText;

                        cli.className = child[ci].className + ' dropem-item dropem-sub-item';

                        cul.appendChild(cli);
                    }

                    var button = document.createElement('button');

                    button.textContent = 'Apply';
                    button.className = 'apply-button-' + i;

                    oli.appendChild(cul);

                    ul.appendChild(oli);

                    ul.appendChild(button);
                }
            }

            frag.appendChild(ul);

            return frag;
        };


        // First we check if the object is not empty, if the object has child elements
        if (!_(self.el.children).isEmpty()) {

            // Create dropdown
            self.newDropdown = self.createDropdown(self.el);

            // Get parent & add class
            self.parent = self.el.parentNode;

            self.parent.className += ' dropem-wrapper';
//                self.parent.style.height = '40px';

            // Append new dropdown to page
            document.querySelectorAll('#page')[0].appendChild(self.newDropdown);

            // Delete the original Select element
//            self.parent.removeChild(self.el); Not used see below

            // Rather than delete -move off screen so still can interact with the original elements
            self.el.style.position = 'absolute';
            self.el.style.top = '-9999px';

            // Grab new dropdown and add styles
            self.newDropem = document.getElementById('dropem-list-' + self.el.id);

            // TODO: Make into function
//            self.newDropem.style.maxHeight = self.newDropem.getBoundingClientRect().height + 'px';
            self.newDropem.style.width = (self.parent.getBoundingClientRect().width + 'px');
            self.newDropem.style.top = (self.parent.getBoundingClientRect().top + self.parent.getBoundingClientRect().height + 'px');
            self.newDropem.style.left = (self.parent.getBoundingClientRect().left + 'px');

            if(self.hasClass(self.newDropem, 'optgroup')) {

                self.newDropem.style.width = (self.parent.getBoundingClientRect().width * 2 + 'px');

            }

            _(self.newDropem.children).each(function(child) {


                if(self.hasClass(child, 'dropem-item')) {

                    // Clicking on options
                    self.addEvent(child, 'click', function() {

                        _(self.newDropem.children).each(function(kid) {

                            kid.className = kid.className.replace(/active/, '');

                        });

                        if(self.hasClass(child, 'active')) {

                            child.className = child.className.replace(/active/, '');

                        } else {

                            child.className += ' active';
                            self.parent.children[0].textContent = this.textContent;
                        }

                    });

                } else if(!!child.children.length) {

                    var adrianChilds;

                    _(child.parentNode.children).each(function(item) {

                        if(self.hasClass(item, 'filter')) {

                            adrianChilds = item;
                        }

                    });


                    if(self.hasClass(child, 'checkbox')) {

                        _(child.children).each(function(loinfruit) {

                            _(loinfruit.children).each(function(rugrat) {

                                // Clicking on options
                                self.addEvent(rugrat, 'click', function() {

                                    var thisLang = rugrat.getAttribute('data-type');



                                    // @fn filter sites by lang

                                    if(adrianChilds !== null) {

                                        _(adrianChilds.children).each(function(childs) {

                                            _(childs.children).each(function(ad) {

                                                ad.className = ad.className.replace(/hidden/, '');

                                                if(ad.getAttribute('data-type') !== thisLang && thisLang !== 'all') {

                                                    ad.className += ' hidden';

                                                }
                                            });
                                        });
                                    }

                                    // Remove ALL active states -only ONE can be active at a time
                                    _(loinfruit.children).each(function(kid) {

                                        kid.className = kid.className.replace(/active/, '');

                                    });

                                    if(self.hasClass(rugrat, 'active')) {

                                        rugrat.className = rugrat.className.replace(/active/, '');

                                    } else {

                                        rugrat.className += ' active';
                                        self.parent.children[0].textContent = this.textContent;
                                    }

                                });
                            });

                        });

                    } else if(self.hasClass(child, 'filter')) {

                        _(child.children).each(function(loinfruit) {

                            _(loinfruit.children).each(function(rugrat) {

                                // All active on load
                                rugrat.className += ' active';

                                // Clicking on options
                                self.addEvent(rugrat, 'click', function() {

                                    if(self.hasClass(rugrat, 'active')) {

                                        rugrat.className = rugrat.className.replace(/active/, '');

                                    } else {

                                        rugrat.className += ' active';
                                    }

                                });
                            });
                        });
                    }

                }
            });

            // Resize dropdown depending on parent width which is driven by responsive css
            self.addEvent(window, 'resize', function() {

                self.newDropem.style.width = (self.parent.getBoundingClientRect().width + 'px');
                self.newDropem.style.top = (self.parent.getBoundingClientRect().top + self.parent.getBoundingClientRect().height + 'px');
                self.newDropem.style.left = (self.parent.getBoundingClientRect().left + 'px');

                if(self.hasClass(self.newDropem, 'optgroup')) {

                    self.newDropem.style.width = (self.parent.getBoundingClientRect().width * 2 + 'px');

                }
            });

            // Resize dropdown depending on parent width which is driven by responsive css
            self.addEvent(window, 'onscroll', function() {

                self.newDropem.style.top = (self.parent.getBoundingClientRect().top + self.parent.getBoundingClientRect().height + 'px');
                self.newDropem.style.left = (self.parent.getBoundingClientRect().left + 'px');

            });


            // Add click event to make dropdown actually drop down...
            self.addEvent(self.parent, 'click', function() {

                self.newDropem.style.width = (self.parent.getBoundingClientRect().width + 'px');
                self.newDropem.style.top = (self.parent.getBoundingClientRect().top + self.parent.getBoundingClientRect().height + 'px');
                self.newDropem.style.left = (self.parent.getBoundingClientRect().left + 'px');

                var mq = document.defaultView.getComputedStyle(document.getElementsByTagName('html')[0], null).getPropertyValue('z-index') || 0;

                if(self.hasClass(self.newDropem, 'optgroup') && mq >= 1024) {

                    self.newDropem.style.width = (self.parent.getBoundingClientRect().width * 2 + 'px');

                }

                // Add active class to dropdown
                if(self.hasClass(self.newDropem, 'active')) {

                    self.newDropem.className = self.newDropem.className.replace(/ active/, '');

                } else {

                    self.newDropem.className += ' active';
                }

                // Add active class to wrapper also
                if(self.hasClass(self.parent, 'active')) {

                    self.parent.className = self.parent.className.replace(/ active/, '');

                } else {

                    self.parent.className += ' active';
                }

            });

            if(!self.hasClass(self.parent, 'multi')) {

                self.addEvent(self.newDropem, 'click', function() {

                    // Add active class to dropdown
                    if(self.hasClass(self.newDropem, 'active')) {

                        self.newDropem.className = self.newDropem.className.replace(/ active/, '');

                    } else {

                        self.newDropem.className += ' active';
                    }

                    // Add active class to wrapper also
                    if(self.hasClass(self.parent, 'active')) {

                        self.parent.className = self.parent.className.replace(/ active/, '');

                    } else {

                        self.parent.className += ' active';
                    }

                });

            }

            self.addEvent(self.boSelecta('.select-anchor'), 'click', function() {


                var list = this.nextSibling;

                if(!self.hasClass(this, 'all')) {

                    _.each(list.querySelectorAll('li'), function(el) {

                        if(self.hasClass(el, 'active')) {

                            el.className = el.className.replace(/active/, '');
                        }
                    });

                } else {

                    _.each(list.querySelectorAll('li'), function(el) {

                        if(!self.hasClass(el, 'active')) {

                            el.className += ' active';
                        }
                    });
                }


                if(!self.hasClass(this, 'all')) {

                    this.textContent = 'select all';
                    this.className = 'select-anchor all';

                } else {

                    this.textContent = 'unselect all';
                    this.className = 'select-anchor';

                }



            });


            // Call callback function
            if(self.callback !== undefined) {

                self.callback();
            }

        }

    });

    return DropEm;
});