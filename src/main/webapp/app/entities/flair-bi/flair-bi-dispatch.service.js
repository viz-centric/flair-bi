(function() {
    "use strict";

    /**
     * Container that contains currently active Widgets
     *
     * Flair-bi page is responsible for modifying this container, but rest of the application can use it.
     */
    angular
        .module("flairbiApp")
        .factory("VisualDispatchService", VisualDispatchService);

    VisualDispatchService.$inject = ['$rootScope','FeatureCriteria','filterParametersService','$window'];
    function VisualDispatchService($rootScope,FeatureCriteria,filterParametersService,$window) {
        var visual = {};
        var filters={};
        var feature={};
        var settings={};
        var visualId='';
        var socketMsgs=[];
        var featureBookmark={};
        var isBookmarkApplied=false;
        var hierarchies=[];
        var savePromptMessage="";
        var viewEditedBeforeSave = false;

        return {
            setVisual: setVisual,
            getVisual: getVisual,
            setFilters: setFilters,
            getFilters: getFilters,
            getFeature:getFeature,
            setFeature:setFeature,
            isFeatureExist:isFeatureExist,
            clearAll: clearAll,
            setSettings:setSettings,
            getSettings:getSettings,
            saveDataConstraints:saveDataConstraints,
            setOpacity:setOpacity,
            removeOpacity:removeOpacity,
            getDashBoard:getDashBoard,
            getView:getView,
            addSocketMsgs:addSocketMsgs,
            getSocketMsgs:getSocketMsgs,
            reloadGrids:reloadGrids,
            addFeatureBookmark:addFeatureBookmark,
            getFeatureBookmark:getFeatureBookmark,
            setApplyBookmark:setApplyBookmark,
            getApplyBookmark:getApplyBookmark,
            saveHierarchies:saveHierarchies,
            getHierarchies:getHierarchies,
            setFeatureBookmark:setFeatureBookmark,
            updateVisual:updateVisual,
            setSavePromptMessage:setSavePromptMessage,
            getSavePromptMessage:getSavePromptMessage,
            setViewEditedBeforeSave:setViewEditedBeforeSave,
            getViewEditedBeforeSave:getViewEditedBeforeSave,
            setIsSaved:setIsSaved
        };

        function setVisual(v) {
            visual=v;
        }

        function getVisual() {
            return visual;
        }

        function updateVisual(visualTemp){
         visual['visual']=visualTemp; 
        }

        function setFilters(f) {
            filters=f;
        }

        function getFilters() {
            return angular.copy(filters);
        }

        function getFeature(){
            return feature;
        }

        function setFeature(vfeature){
            feature=vfeature;
        }
        
        function isFeatureExist(){
            var features = visual.visual.fields.filter(function(item) {
                return item.feature!=null && item.feature.definition === feature.definition;
            });
            return features.length>0?false:true;
        }

        function clearAll(){
            visual = {};
            filters={};
            feature={};
            settings={};
        }

        function setSettings(FSsettings){
            settings=FSsettings;
        }

        function getSettings(){
            return angular.copy(settings);
        }
        function saveDataConstraints(dc){
            visual.visual['conditionExpression']=dc;
        }

        function setOpacity(vId){
            visualId=vId;
            var elements=$('div[container-id]');
            for(var i in elements){
                if(elements[i].id!=vId)
                    $('#'+elements[i].id ).addClass('unselected-vizualization'); 
            }
            $('div[container-id='+visualId+']').addClass('selected-vizualization');
        }
        
        function removeOpacity(){
            var elements=$('div[container-id]');
            for(var i in elements){
                $('#'+elements[i].id ).removeClass('unselected-vizualization'); 
            }
            if(visualId!='')
            $('div[container-id='+visualId+']').removeClass('selected-vizualization');
        }

        function getView(views,id){
            return views.filter(function(item) {
                return item.id === id;
            })[0];
        }

        function getDashBoard(dashboards,id){
            return dashboards.filter(function(item) {
                return item.id === id;
            })[0];   
        }

        function addSocketMsgs(msg){
            socketMsgs.push(msg);
        }

        function getSocketMsgs(){
            return socketMsgs; 
        }
        function reloadGrids(){
            var elements=$('div[visual-build-id-resize]');
       
            for (let index = 0; index < elements.length; index++) {
                $rootScope.$broadcast(
                    "refresh-widget-content-" + elements[index].id || elements[index].id
                    );
                
            }
        }

        function addFeatureBookmark(viewId,dashboardId,bookmark){
            FeatureCriteria.query(
                {
                    featureBookmark: bookmark.id
                },
                function(result) {
                    bookmark.featureCriteria = result;
                    var filter = {};
                    bookmark.featureCriteria.forEach(function(criteria) {
                        filter[
                            criteria.feature.name
                        ] = criteria.value.split("||");
                    });
                    filterParametersService.save(filter);
                    isBookmarkApplied=true;
                    $window.location.href="#/dashboards/"+dashboardId+"/views/"+viewId+"/build";
                }
            );
            featureBookmark=bookmark;
        }

        function setFeatureBookmark(bookmark){
            featureBookmark=bookmark;
        }

        function getFeatureBookmark(){
            return featureBookmark;
        }
        function setApplyBookmark(flag){
            isBookmarkApplied=flag;
        }
        function getApplyBookmark(){
            return isBookmarkApplied;
        }
        function saveHierarchies(hierarchiesDTO){
            hierarchies=hierarchiesDTO;
        }
        function getHierarchies(){
            return hierarchies;
        }
        function setSavePromptMessage(message){
            savePromptMessage=message;
        }
        function getSavePromptMessage(){
            return savePromptMessage;
        }
        function setViewEditedBeforeSave(viewEditedBeforeSaveTemp){
            viewEditedBeforeSave=viewEditedBeforeSaveTemp
        }
        function getViewEditedBeforeSave(){
            return viewEditedBeforeSave;
        }
        function setIsSaved(flag){
            visual.visual.isSaved = flag;
        }
    }
})();
