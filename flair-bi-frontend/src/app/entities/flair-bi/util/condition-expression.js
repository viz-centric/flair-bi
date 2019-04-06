import * as angular from 'angular';

'use strict';
angular
    .module('flairbiApp')
    .constant('ConditionExpression', ConditionExpression);


function ConditionExpression(uuidGenerator, expression) {
    this.uuidGenerator = uuidGenerator;
    this.expression = expression || {
        '@type': 'Compare',
        comparatorType: 'EQ'
    };
    this.expression.uuid = this.uuidGenerator();
}

ConditionExpression.prototype.addNewExpression = addNewExpression;
ConditionExpression.prototype.removeExpression = removeExpression;




/**
 * Add new expression to expression tree
 *
 * @param {any} exp
 * @param {any} type
 */
function addNewExpression(exp, type) {
    var newExpression = angular.copy(exp);
    newExpression.uuid = this.uuidGenerator();
    this.expression = {
        firstExpression: this.expression,
        secondExpression: newExpression,
        '@type': type || 'And',
        uuid: this.uuidGenerator()
    }
}



/**
 * Remove expression from expression tree
 *
 *
 * @param {any} expression : expression to be removed
 */
function removeExpression(expression) {
    if (this.expression.uuid === expression.uuid) {
        this.expression = null;
    } else {
        var changes = [];
        depthFirstVisit(this.expression, function (current, previous, previousLeaf, parent) {
            if (current.uuid === expression.uuid) {
                var newParent;
                if (parent.firstExpression && parent.firstExpression.uuid === condition.uuid) {
                    newParent = angular.copy(parent.secondExpression);
                } else if (parent.secondExpression && parent.secondExpression.uuid === condition.uuid) {
                    newParent = angular.copy(parent.firstExpression);
                }
                newParent.uuid = parent.uuid;

                changes.push(newParent);
            }
        });
        this.expression = applyChanges(this.expression, changes);
    }
}

/**
 * Go through condition expression and apply changes to each node based on uuid
 *
 * @param {any} exp : expression where changes will be applied
 * @param {any} changes : list of new nodes that contain new changes
 * @returns changes expression
 */
function applyChanges(exp, changes) {
    var expression = angular.copy(exp);
    var element = changes.filter(function (item) {
        return item.uuid === expression.uuid;
    })[0];
    if (element) {
        expression = element;
        changes.splice(changes.indexOf(element), 1);
        return expression;
    }
    if (expression.firstExpression) {
        expression.firstExpression = applyChanges(expression.firstExpression, changes);
    }
    if (expression.secondExpression) {
        expression.secondExpression = applyChanges(expression.secondExpression, changes);
    }
    return expression;

}

/**
 *
 * Iterate though condition expression and apply visitors
 *
 * @param {any} expression root expression
 * @param {any} visitors list of functions to be called on each node
 */
function depthFirstVisit(expression, visitors) {
    var stack = [expression];
    var current, previous, previousLeaf, parent;

    while (stack.length > 0) {

        current = stack.pop();
        if (current.secondExpression) {
            current.secondExpression.parent = current;
            stack.push(current.secondExpression);
        }
        if (current.firstExpression) {
            current.firstExpression.parent = current;
            stack.push(current.firstExpression);
        }

        parent = current.parent;
        delete current.parent;
        //process node
        if (visitors instanceof Array) {
            visitors.forEach(function (visitor) {

                visitor(current, previous, previousLeaf, parent);
            });
        } else if (visitors instanceof Function) {
            visitors(current, previous, previousLeaf, parent);
        }


        previous = current;

        /*
            it is leaf if it does not have this elements
        */
        if (!current.firstExpression && !current.secondExpression) {
            previousLeaf = current;
        }

    }

}