export { initializeTreeEvents, initializeTree }; 

import { getSitecoreOrigin } from "./url.js";
import { invokeGetItemAPI, invokeGetChildrenAPI, getItemId } from "./itemservice.js"; 
import { updateTemplateFields } from "./fields.js";
import { reinitializeValidations } from "./form.js";

const initializeTreeEvents = function(){    
    $('.sitecore-tree').on("select_node.jstree", function (event, selected) {
        var associatedPathSelector = $('.tree-icon.active').siblings('.path-selector');
        if(associatedPathSelector.val().replace('/$name', '') != selected.node.data){
            associatedPathSelector.val(`${selected.node.data}${associatedPathSelector.hasClass('target-selector') ? '/$name' : ''}`);
            associatedPathSelector.attr('data', selected.node.id);
            updateTemplateFields('.tree-icon.active', selected.node.id);

            $('.close-icon').trigger('click');
            reinitializeValidations();
        }
    });

    $(document).on('focusout', '.template-selector', function(e){
        var templateId = getItemId(e.currentTarget.value);
        updateTemplateFields(e.currentTarget, templateId);
    });

    $(document).on('click', '[href$="PathPanel"]', function (e) {
        e.stopPropagation();
        e.preventDefault();
        
        $(e.currentTarget).toggleClass('active');
        if($(e.currentTarget).hasClass('active'))
            expandTree(e.currentTarget);
    });
}

const initializeTree = function(){
    $('.sitecore-tree').each(function() {
        var rootItemId = $(this).attr('data-rootnode');
        $(this).jstree({
            "core" : {
            'multiple': false,
            "themes" : {
                "default" : "large",
                "dots" : false
            },
            'data' : function(node, cb){
                if(node.id == '#')
                    cb(getRootNode(rootItemId));
                else
                    cb(getChildNodes(node.id));
            }
            }
        });
    });
}

const getRootNode = function(itemid){
    var itemInfo = invokeGetItemAPI(itemid);
    return getTreeObject(itemInfo);
}

const getChildNodes = function(parentId){
    var treeNodes = [];
    var items = invokeGetChildrenAPI(parentId);
    items.forEach(function(itemInfo) {
        treeNodes.push(getTreeObject(itemInfo));
    });
    return treeNodes;
}

const getTreeObject = function(itemInfo){
    var treeInfo = {
        "id": itemInfo.ItemID,
        "text": itemInfo.ItemName,
        "data": itemInfo.ItemPath,
        "icon": `${getSitecoreOrigin()}${itemInfo.ItemIcon}`,
        "children": true
    }
    return treeInfo;
}

const expandTree = function(target){
    var itemPath = $(target).closest('div').children('input').val();
    if(itemPath){
        var treeContainerId = $(target).attr('href');
        var nodesToExpand = [];
        var currentItemPath = '/sitecore';
        itemPath.split('/').forEach(function(itemName) {
            if(itemName.trim() != '' && itemName.trim() != '$name' && itemName.toLowerCase() != 'sitecore'){
                currentItemPath += `/${itemName}`;
                nodesToExpand.push(getItemId(currentItemPath));
            }
        });
        openNode(treeContainerId, nodesToExpand);
    }
}

const openNode = function(treeContainerId, nodesToExpand){
    var tree = $(`${treeContainerId} .sitecore-tree`).jstree();
    tree.load_node(nodesToExpand, function() {
        tree.open_node(nodesToExpand[nodesToExpand.length - 2]);
        tree.select_node(nodesToExpand[nodesToExpand.length - 1]);
    });
}