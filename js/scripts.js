$(document).ready(function(){
    $('.grid').masonry({
        itemSelector: '.quizzes__item',
        columnWidth: 420,
        gutter: 20,
    });
});

var hamburger = document.querySelector(".js-hamburger");
var menuMobile = document.querySelector(".js-main-menu");

if(menuMobile) {
    menuMobile.classList.add("hidden");
    hamburger.addEventListener("click", function (evt) {
        evt.preventDefault();
        hamburger.classList.toggle("open");
        menuMobile.classList.toggle("open");
    });
}

var search = document.querySelector(".js-search");
var searchInput = document.querySelector(".js-search-input");

if(searchInput) {
    searchInput.classList.add("hidden");
    search.addEventListener("click", function (evt) {
        evt.preventDefault();
        search.classList.toggle("open");
        searchInput.classList.toggle("open");
    });
}

var login = document.querySelector(".js-login");
var pushUp = document.querySelector(".js-push-up");
var pushUpBody = document.querySelector(".js-push-up-body");

if(pushUp) {
    pushUp.classList.add("hidden");
    login.addEventListener("click", function (evt) {
        evt.preventDefault();
        login.classList.toggle("show");
        pushUp.classList.toggle("show");
        pushUpBody.classList.toggle("show");
    });
}

$(document).ready(function() {

    frontend.isMobile = $('body').outerWidth() < 481;
    frontend.isTablet = $('body').outerWidth() < 1201;

    frontend.tabs.init();
    frontend.tinySlider.init();

    $(window).resize(function() {
        frontend.isMobile = $('body').outerWidth() < 481;
        frontend.isTablet = $('body').outerWidth() < 1201;
    });
});

var frontend = new function() {
    var self = this;

    this.params = {
        'bodyContainer': $('body')
    };

    this.tabs = new function() {
        var that = this;

        this.init = function() {
            $('.js-tabs:not(.js-already-init)').each(function() {
                that.build(this);
            });

            $('.js-anchor').click(function(){
                var offset = ss.isMobile ? $(this).data('mobileOffset') : $(this).data('offset'),
                    position = $($(this).data('anchor')).offset().top;
                $(document).scrollTop(position - offset);
            });
        };

        this.customize = {
            li: function(li) {
                if ($(li).hasClass('js-active')) {
                    $(li).addClass('tabs__item--active');
                } else {
                    $(li).removeClass('tabs__item--active');
                }
            },
            tab: function(tab) {
                if ($(tab).hasClass('js-show')) {
                    $(tab).addClass('tabs__pane--active');
                } else {
                    $(tab).removeClass('tabs__pane--active');
                }
            }
        };

        this.build = function(ul) {
            if (!$(ul).data('contId') && !$($(ul).data('contSelector')).length) {
                that.buildLinks(ul);
            } else {
                that.buildTabs(ul);
            }

            $(ul).addClass('js-already-init');
        };

        this.buildTabs = function(ul) {
            var tabsCont;
            if ($(ul).data('cont-id')) {
                tabsCont = $('#' + $(ul).data('cont-id'));
            } else {
                tabsCont = $($(ul).data('cont-selector'));
            }

            $(ul).find('li a').click(function() {
                that.changeLinks(ul, this);

                var li = $(this).parents('li');
                var tabContSelector;
                if ($(li).data('tab-id')) {
                    tabContSelector = '>.js-tab-cont#' + $(li).data('tab-id');
                } else if ($(ul).data('tab-selector')) {
                    tabContSelector = '>.js-tab-cont' + $(li).data('tab-selector');
                }

                var tab = $(tabsCont).find(tabContSelector);
                $(tabsCont).find('>.js-tab-cont.js-show').removeClass('js-show').hide();
                $(tab).addClass('js-show').show();
                $.each($(tabsCont).find('>.js-tab-cont'), function() {
                    that.customize.tab(this);
                });

                var tabsCallback = $(ul).data('callback');
                if (tabsCallback && that.callbacks[tabsCallback]) {
                    that.callbacks[tabsCallback](ul);
                }

            });
        };

        this.buildLinks = function(ul) {
            var containers = [];

            $(ul).find('li a').each(function() {
                var anchor = $(this).data('anchor');
                if (anchor && $(anchor).length) {
                    var top = $(anchor).offset().top;
                    var offset = ss.isMobile ? $(this).data('mobileOffset') : $(this).data('offset');
                    if (offset) {
                        top -= parseInt(offset, 10);
                    }
                    containers.push({'top': --top, 'el': $(this)});
                }
            });

            if (containers.length) {
                $(window).scroll(function() {
                    var top = $(this).scrollTop(), need;
                    $.each(containers, function(i, el) {
                        if (top >= el.top) {
                            need = el;
                        }
                    });
                    if (need) {
                        that.changeLinks(ul, need.el);
                    }
                });

                $(window).scroll();
            }
        };

        this.changeLinks = function(ul, a) {
            var li = $(a).parents('li');
            $(ul).find('li.js-active').removeClass('js-active');
            $(li).addClass('js-active');
            $(ul).find('li').each(function() {
                that.customize.li(this);
            });
        };

        this.destroy = function(ul) {
            $(ul).find('li a').off('click');
        };

        this.callbacks = {};
    };

    this.tinySlider = new function() {
        let that = this;

        this.sliders = {};

        this.timers = {};

        this.init = function() {
            $('.js-tiny-slider').each(function(k) {
                let slider = this, data = $(this).data,
                    initialWidth = data['initialWidth'], bodyWidth = $('body').outerWidth(), sliderName = data['sliderName'] ? data['sliderName'] : k;
                if (initialWidth) {
                    if (initialWidth >= bodyWidth) {
                        that.build(this, k);
                    }

                    $(window).resize(function() {
                        if (that.timers[sliderName]) {
                            clearTimeout(that.timers[sliderName]);
                            delete that.timers[sliderName];
                        }
                        that.timers[sliderName] = setTimeout(function() {
                            let bodyWidth = $('body').outerWidth();
                            if (initialWidth >= bodyWidth) {
                                that.build(slider, sliderName);
                            } else if (that.sliders[sliderName]) {
                                that.destroy(slider, sliderName);
                            }
                        }, 100);
                    });
                } else {
                    that.build(this, sliderName);
                }
            });
        };

        this.build = function(slider, k) {
            if (!$(slider).hasClass('js-already-init')) {
                let sliderClass = 'js-tiny-slider-' + k,
                    sliderSelector = '.' + sliderClass;
                $(slider).addClass(sliderClass).data('sliderIndex', k);
                let data = $(slider).data();
                let params = {
                    //Контейнеры
                    container        : data['container']         ? data['container']         : sliderSelector, //селектор контейнера для слайдера
                    controlsContainer: data['controlsContainer'] ? data['controlsContainer'] : false, //селектор контейнера для стрелок
                    navContainer     : data['navContainer']      ? data['navContainer']      : false, //селектор контейнера для точек
                    //Стрелки и точки
                    controls       : data['controls']        ? data['controls']              : false, //кнопки
                    prevButton     : data['prevButton']      ? $(data['prevButton']).get(0)  : false, //селектор кнопки пред. слайда
                    nextButton     : data['nextButton']      ? $(data['nextButton']).get(0)  : false, //селектор кнопки след. слайда
                    nav            : data['nav']             ? data['nav']                   : false, //точки [dots]
                    navAsThumbnails: data['navAsThumbnails'] ? data['navAsThumbnails']       : false, //навигация в виде мини-картинок

                    //Основные параметры
                    mode      : data['mode']       ? data['mode']        : 'carousel',
                    items     : data['items']      ? data['items']      : 1,            //количество видимых элементов слайдов
                    slideBy   : data['slideBy']    ? data['slideBy']    : 1,            //на сколько слайдов сдвигать
                    startIndex: data['startIndex'] ? data['startIndex'] : false,        //начальный слайд
                    autoWidth : data['autoWidth']  ? data['autoWidth']  : false,        //автоматическое определение ширины слайда
                    autoHeight: data['autoHeight'] ? data['autoHeight'] : false,        //автоматическое определение высоты слайда,
                    fixedWidth: data['fixedWidth'] ? data['fixedWidth'] : false,        //фиксированная ширина слайда
                    loop      : data['loop']       ? data['loop']       : false,        //бесконечность прокрутки
                    speed     : data['speed']      ? data['speed']      : 300,          //скорость прокрутки
                    lazyload  : data['lazyload']   ? data['lazyload']   : false,        //ленивая загрузка
                    axis      : data['axis']       ? data['axis']       : 'horizontal', //['horizontal', 'vertical'] горизонтальная/вертикальная прокрутка
                    gutter    : data['gutter']     ? data['gutter']     : 0,            //расстояние между слайдами, в px
                    center    : data['center']     ? data['center']     : false,        //центрирование активного слайда

                    //Автопрокрутка
                    autoplay            : data['autoplay']             ? data['autoplay']             : false,     //автопрокрутка
                    autoplayButtonOutput: data['autoplayButtonOutput'] ? data['autoplayButtonOutput'] : false,     //кнопки для автопрокрутки
                    autoplayTimeout     : data['autoplayTimeout']      ? data['autoplayTimeout']      : 5000,      //задержка прокрутки
                    autoplayDirection   : data['autoplayDirection']    ? data['autoplayDirection']    : 'forward', //['forward', 'backward'] направленность прокрутки
                    autoplayText        : data['autoplayText']         ? data['autoplayText']         : false,     //['start', 'stop'] //текст кнопок прокрутки
                    autoplayHoverPause  : data['autoplayHoverPause']   ? data['autoplayHoverPause']   : false,     //остановка при наведении мыши

                    //Респонсив
                    responsive: data['responsive'] ? data['responsive'] : false //{breakpoint: {key: value, [...]}}}
                };

                let tnsSlider = tns(params);
                this.sliders[data['sliderName'] ? data['sliderName'] : k] = tnsSlider;
                $(slider).removeClass(sliderClass);

                if ($(slider).data('transitionStart') && that.callbacks[$(slider).data('transitionStart')]) {
                    tnsSlider.events.on('transitionStart', that.callbacks[$(slider).data('transitionStart')]);
                }

                if ($(slider).data('transitionEnd') && that.callbacks[$(slider).data('transitionEnd')]) {
                    tnsSlider.events.on('transitionEnd', that.callbacks[$(slider).data('transitionEnd')]);
                }
                $(slider).removeClass(sliderClass);
                $(slider).addClass('js-already-init');
            }
        };

        this.destroy = function(slider, k) {
            $(slider).removeClass('js-already-init');
            that.sliders[k].destroy();
            delete that.sliders[k];
        };

        this.callbacks = {};
    };
};