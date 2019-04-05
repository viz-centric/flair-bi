(function() {
    "use strict";

    /**
     * Container that contains currently active Widgets
     *
     * Flair-bi page is responsible for modifying this container, but rest of the application can use it.
     */
    angular
        .module("flairbiApp")
        .factory("VisualMetadataContainer", VisualMetadataContainer);

    VisualMetadataContainer.$inject = ["VisualWrap","$rootScope"];

    function VisualMetadataContainer(VisualWrap,$rootScope) {
        var visualMetadataContainer = [];

        return {
            add: add,
            remove: remove,
            removeById: removeById,
            getAll: getAll,
            getOne: getOne,
            getOneVBuildId:getOneVBuildId,
            clear: clear,
            update:update
        };

        /**
         *
         * Add a widget to the container
         *
         * @param {any} widget
         * @return container
         */
        function add(widget) {
            if (widget.constructor === Array) {
                var widgetCont = widget.map(function(item) {
                    item.visualBuildId = item.visualBuildId || item.id;
                    return new VisualWrap(item);
                });

                visualMetadataContainer = visualMetadataContainer.concat(
                    widgetCont
                );
            } else {
                var w = angular.copy(widget);
                w.visualBuildId = w.visualBuildId || w.id;
                visualMetadataContainer.push(new VisualWrap(w));
            }

            return visualMetadataContainer;
        }

        /**
        Update a widget to the container
        @param id of widget, 
        @param {any} widget, 
        @param key determine whether widget is being updated first time
        **/
        
        function update(id,widget,key){
            var index = -1;
            visualMetadataContainer.some(function(item, i) {
                return item[key] === id ? index = i : false;
            });
            if(key==='id'){
                angular.forEach(widget, function(value, widgetKey){
                    visualMetadataContainer[index][widgetKey]=value;
                });
                $rootScope.$broadcast("update-widget-content-" + id);
            }else{
                var w = angular.copy(widget);
                w.visualBuildId = w.visualBuildId || w.id;               
                visualMetadataContainer[index]=new VisualWrap(w);
            }
        }

        /**
         *
         * Remove widget from the container
         *
         * @param {any} widget
         * @return container
         */
        function remove(widget) {
            var index = visualMetadataContainer.indexOf(widget);
            if (index > -1) {
                visualMetadataContainer.splice(index, 1);
            }

            return visualMetadataContainer;
        }

        /**
         *
         * Remove element by id
         *
         * @param {any} id
         * @return update container
         */
        function removeById(id) {
            visualMetadataContainer = visualMetadataContainer.filter(function(
                item
            ) {
                return item.id !== id;
            });

            return visualMetadataContainer;
        }

        /**
         * Get the whole container
         *
         */
        function getAll() {
            return angular.copy(visualMetadataContainer);
        }

        /**
         * Get widget by it's id
         *
         * @param {any} id
         * @returns widget or null if not found
         */
        function getOne(id) {
            return visualMetadataContainer.filter(function(item) {
                return item.id === id;
            })[0];
        }

         /**
         * Get widget by it's visual build id
         *
         * @param {any} id
         * @returns widget or null if not found
         */
        function getOneVBuildId(id) {
            return visualMetadataContainer.filter(function(item) {
                return item.visualBuildId === id;
            })[0];
        }

        /**
         * Empty the container
         *
         * @return container
         */
        function clear() {
            visualMetadataContainer = [];
            return visualMetadataContainer;
        }
    }
})();
