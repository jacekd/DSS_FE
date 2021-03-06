'use strict';
angular.module('nouislider', []).directive('slider', function () {
    return {
        restrict: 'A',
        scope: {
            start: '=',
            step: '=',
            end: '=',
            callback: '@',
            margin: '@',
            ngModel: '=',
            ngFrom: '=',
            ngTo: '='
        },
        link: {
            pre: function (scope, element, attrs) {
                var callback, fromParsed, parsedValue, slider, toParsed;
                slider = $(element);
                callback = scope.callback ? scope.callback : 'slide';
                if (scope.ngFrom != null && scope.ngTo != null) {
                    fromParsed = null;
                    toParsed = null;
                    slider.noUiSlider({
                        start: [
                                scope.ngFrom || parseFloat(scope.start),
                                scope.ngTo || parseFloat(scope.end)
                        ],
                        step: parseFloat(scope.step || 1),
                        connect: true,
                        margin: parseFloat(scope.margin || 0),
                        range: {
                            min: [parseFloat(scope.start)],
                            max: [parseFloat(scope.end)]
                        }
                    });
                    slider.on(callback, function () {
                        var from, to, _ref;
                        _ref = slider.val(), from = _ref[0], to = _ref[1];
                        fromParsed = parseFloat(from);
                        toParsed = parseFloat(to);

                        //Propagate event upwards
                        var type = attrs.hashKey ? attrs.hashKey.indexOf('likelihood') !== -1 ? 'likelihood' : 'consequence' : '';
                        scope.$emit('sliderValueChanged', {slider: slider, value: slider.val(), init: false, type: type, model: attrs.model});

                        return scope.$apply(function () {
                            scope.ngFrom = fromParsed;
                            return scope.ngTo = toParsed;
                        });
                    });
                    scope.$watch('ngFrom', function (newVal, oldVal) {
                        if (newVal !== fromParsed) {
                            return slider.val([
                                newVal,
                                null
                            ]);
                        }
                    });

                    return scope.$watch('ngTo', function (newVal, oldVal) {
                        if (newVal !== toParsed) {
                            return slider.val([
                                null,
                                newVal
                            ]);
                        }
                    });
                } else {
                    parsedValue = null;
                    // console.log('ngModel in slider: ', scope.ngModel);
                    // console.log('start/end', scope.start, scope.end);
                    slider.noUiSlider({
                        start: [scope.start || scope.ngModel],
                        step: parseFloat(scope.step || 1),
                        range: {
                            min: [parseFloat(scope.start)],
                            max: [parseFloat(scope.end)]
                        }
                    });
                    slider.on(callback, function () {

                        parsedValue = parseFloat(slider.val());
                        // console.log('slider parsed value', parsedValue);

                        //Propagate event upwards
                        var type = attrs.hashKey ? attrs.hashKey.indexOf('likelihood') !== -1 ? 'likelihood' : 'consequence' : '';
                        scope.$emit('sliderValueChanged', {slider: slider, value: slider.val(), init: false, type: type, model: attrs.model});

                        return scope.$apply(function () {
                            return scope.ngModel = parsedValue;
                        });
                    });

                    return scope.$watch('ngModel', function (newVal, oldVal) {
                        if (newVal !== parsedValue) {
                            return slider.val(newVal);
                        }
                    });
                }
            },
            post: function(){
                //
            }
        }
    }
});
