/*************************************************************************
 * Created by Todd M. Eischeid
 * March 2017
 *
 * Water Valve Chart
 * 
 * Graph for visualizing logical statements and groupings. could also be used
 * to build logical statements by clicking on a connection to add an item.
 *
 *************************************************************************/


function WaterValveChart(config) {

    this.cfg = {
        width: 1400,
        height: 500,
        groupSize: 200,
        data: ["and", "A", "B"],
        containerSelector: "body",
        highlightColor: "#5e58fe",
        pad: 40,
        graphDirection: "horizontal", // vertical or horizontal
        onGroupClick: null,
        onItemClick: null,
        evaluationResultField: "evalResult"  //the field name in each object that indicates the evaluation result of that rule.
    };

    
    //assign incoming config settings; will override defaults, and add new fields if included
    for (var fld in config) {
        this.cfg[fld] = config[fld];
    }
}


//this is essentially a recreation of d3.diagonal, as it is not in d3v4
WaterValveChart.prototype.drawDiagTopDown = function(d) {

        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;

};

//this is essentially a recreation of d3.diagonal, as it is not in d3v4
WaterValveChart.prototype.drawDiagLeftRight = function(d) {

    return "M" + d.source.x + "," + d.source.y
        + "C" + (d.source.x + d.target.x) / 2 + "," + d.source.y
        + " " + (d.source.x + d.target.x) / 2 + "," + d.target.y
        + " " + d.target.x + "," + d.target.y;

};


//super-compact solution for UUID generation, from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
WaterValveChart.prototype.generateUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return  v.toString(16);
    });
};


/**
 * Creates a text-based statement from the data.
 * @returns {string}
 */
WaterValveChart.prototype.generateStatement = function() {

    var me = this;
    var result = "";
    var _and_ = "and";
    var _or_ = "or";

    for (i = 1; i < me.cfg.data.length; i++) {

        if (me.cfg.data[0] == _and_) {

            if (Array.isArray(me.cfg.data[i])) {
                result +=  " (";
                for (j = 1; j < me.cfg.data[i].length; j++) {

                    if (Array.isArray(me.cfg.data[i][j])) {

                        result += "(";
                        for (k = 1; k < me.cfg.data[i][j].length; k++) {
                            result += me.cfg.labelField ? me.cfg.data[i][j][k][me.cfg.labelField] : me.cfg.data[i][j][k];
                            if (k < me.cfg.data[i][j].length - 1) { result += " " + me.cfg.data[i][j][0].toUpperCase() + " "; }
                        }
                        result += ")";
                        if (j < me.cfg.data[i].length - 1) { result += " " + me.cfg.data[i][0].toUpperCase() + " "; }

                    } else {
                        result += me.cfg.labelField ? me.cfg.data[i][j][me.cfg.labelField] : me.cfg.data[i][j]  ;
                        if (j < me.cfg.data[i].length - 1) { result += " " + me.cfg.data[i][0].toUpperCase() + " "; }
                    }
                }
                result += ") ";
                if (i < me.cfg.data.length - 1) { result += me.cfg.data[0].toUpperCase() + " "; }

                //if top level group is not an array, but just a single item.
            } else {

                result += me.cfg.labelField ? me.cfg.data[i][me.cfg.labelField] : me.cfg.data[i];
                if (i < me.cfg.data.length - 1) { result += " " + me.cfg.data[0].toUpperCase() + " "; }
            }
        }

        if (me.cfg.data[0] == _or_) {

        }
        result += " ";
    }
    return result;
    };

/**
 * Calculate and return the data for the points coordinates and the connections coordinates for drawing the path.
   this approach provides freedom in how the points and connections are rendered.
 * @returns {Array}
 */
WaterValveChart.prototype.getLayout = function() {

    var me = this;
    var _and_ = "and";
    var _or_ = "or";
    var points_connections = [];
    var nodeSpacing = 50;
    var pad = 20;
    var i = 0;
    var j = 0;
    var k = 0;
    var a = 0;
    var b = 0;
    var groupPoints;
    var groupConnections;

    //this is the main method that places the nodes/points
    function pushPointsObj(itemArray, index, level, parentItemArray, indexParent, itemIsScalar) {
        var subitemSpacing = 40;
        var result = {};
        var posAdjust = 0;
        var posAdjustParent = 0;
        if (level > 1) { posAdjust = index * subitemSpacing; }
        if (level > 1) { posAdjustParent = indexParent * subitemSpacing; }
        var itemSpacing = (me.cfg.groupSize / (itemArray.length ));
        var itemTotalHeight = itemSpacing * (itemArray.length);

        if (level > 1) { itemSpacing = (me.cfg.groupSize / (parentItemArray.length )); }

        //TODO: refactor so that we have a block for level=1 and another for level=2
        if (level == 1) {

        }


        if (level > 1) {

        }


        if (itemArray[0] == _or_) {

            //itemSpacing = (me.cfg.groupSize / (itemArray.length ));

            //if level>1 then we'll assume that level 1 is _and_
            result = {
                id: me.generateUUID(),
                x:  (level > 1) ? indexParent * itemSpacing : (me.cfg.groupSize/2) ,
                y:  index * (me.cfg.groupSize / (itemArray.length )) - (itemTotalHeight/2),
                itemLevel: level,
                indexInGroup: index,
                indexInParentGroup: indexParent,
                firstInGroup: (index == 1) || itemIsScalar,
                firstInParentGroup: (indexParent == 1) || itemIsScalar,
                lastInGroup: (index == itemArray.length - 1) || itemIsScalar,
                lastInParentGroup: (indexParent == parentItemArray.length - 1) || itemIsScalar,
                groupKind: itemArray[0],
                parentGroupKind: (level > 1) ? parentItemArray[0] : null,
                groupNumber: points_connections.length,
                value: itemArray[index]  //+ "" + points_connections.length
            };
        }


        if (itemArray[0] == _and_) {
            //if level 2 (which is the deepest allowed level, and the items are in an 'and' group,
            // that means they will each be lined up with one another in the sublevel.
            // then we determine how many items are in the group and position the items accordingly so as to be centered.

            result = {
                id: me.generateUUID(),
                x: (level > 1) ? (index * subitemSpacing) - ((subitemSpacing * itemArray.length)/2) + (me.cfg.groupSize/2) : (index * itemSpacing) - ((itemSpacing * itemArray.length)/2) + (me.cfg.groupSize/2),
                y: (level > 1) ?  indexParent * itemSpacing  - (itemTotalHeight/2) : 0,
                itemLevel: level,
                indexInGroup: index,
                indexInParentGroup: indexParent,
                firstInGroup: (index == 1) || itemIsScalar,
                firstInParentGroup: (indexParent == 1) || itemIsScalar,
                lastInGroup: (index == itemArray.length - 1) || itemIsScalar,
                lastInParentGroup: (indexParent == parentItemArray.length - 1) || itemIsScalar,
                groupKind: itemArray[0],
                parentGroupKind: (level > 1) ? parentItemArray[0] : null,
                groupNumber: points_connections.length,
                value: itemArray[index]  //+"" + points_connections.length
            };
        }

        groupPoints.push(result);
        return result;
    }



    //ideally we should be recursive here in searching for nested arrays, but realistically, after about 3 levels
    // it becomes too difficult to comprehend the logic anyway; not very practical for a visual display.
    // So, we accommodate a max of 3 levels
    for (i = 1; i < me.cfg.data.length; i++) {

        //each i loop will be a group
        groupPoints = [];
        groupConnections = [];
        groupPoints.push({
                x: 0,
                y: 0,
                id: me.generateUUID(),
                groupStartMarker: true,
                groupKind: me.cfg.data[0],
                groupNumber: points_connections.length
        });


        //if top level groups are and-ed together
        if (me.cfg.data[0] == _and_) {

            //each group array element will either be array or some object; an array is 'special' in that it indicates a logical grouping
            if (Array.isArray(me.cfg.data[i])) {

                //we start at index 1 because index 0 is always the operator
                for (j = 1; j < me.cfg.data[i].length; j++) {

                    if (Array.isArray(me.cfg.data[i][j])) {

                        for (k = 1; k < me.cfg.data[i][j].length; k++) {
                            pushPointsObj(me.cfg.data[i][j], k, 2, me.cfg.data[i], j, false);
                        }
                    } else {
                       pushPointsObj(me.cfg.data[i], j, 1, i, true);
                    }
                }

            //if top level group is not an array, but just a single item.
            } else {
                groupPoints.push({
                    x: (me.cfg.groupSize/2) ,
                    y: 0,
                    id: me.generateUUID(),
                    value: me.cfg.data[i], //+ " " + points_connections.length,
                    groupKind: me.cfg.data[0],
                    groupNumber: points_connections.length,
                    itemLevel: 1,
                    firstInGroup: true,
                    lastInGroup: true
                });

            }
        }


        if (me.cfg.data[0] == _or_) {


        }


        groupPoints.push({
            x: me.cfg.groupSize,
            id: me.generateUUID(),
            y: 0,
            groupEndMarker: true,
            groupKind: me.cfg.data[0],
            groupNumber: points_connections.length
        });



        //****************  make all of the connections  *******************
        // these two loops will compare each item to every other item.
        for (a = 1; a < groupPoints.length; a++) {
            for (b = 1; b < groupPoints.length; b++) {
                if (a == b) { continue; } //ignore self

                //if level one item in an 'or' group, which basically means a scalar item
                if ((groupPoints[a].groupKind == _or_) && (groupPoints[a].itemLevel == 1)) {

                    //current item connect to start node
                    groupConnections.push({
                        source: {x: groupPoints[0].x, y: groupPoints[0].y, id: groupPoints[0].id},
                        target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                    });

                    //current item connect to end node
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[groupPoints.length - 1].x, y: groupPoints[groupPoints.length - 1].y, id: groupPoints[groupPoints.length - 1].id}
                    });
                }

                //if a level 2 item (meaning, for example, an 'and' group within and overall 'or' group), and the FIRST one in that sub-group, then connect to start node
                if ((groupPoints[a].parentGroupKind == _or_) && (groupPoints[a].itemLevel == 2) && (groupPoints[a].firstInGroup)) {
                    groupConnections.push({
                        source: {x: groupPoints[0].x, y: groupPoints[0].y, id: groupPoints[0].id},
                        target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                    });
                }

                //if a level 2 item (meaning, for example, an 'and' group within and overall 'or' group), and the LAST one in that sub-group, then connect to END node
                if ((groupPoints[a].parentGroupKind == _or_) && (groupPoints[a].itemLevel == 2) && (groupPoints[a].lastInGroup)) {
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[groupPoints.length - 1].x, y: groupPoints[groupPoints.length - 1].y, id: groupPoints[groupPoints.length - 1].id}
                    });
                }

                //if we're in a level 2 'and' group, then just connect adjacent items to one another.
                if ((groupPoints[a].groupKind == _and_) && (groupPoints[a].itemLevel == 2) && (!(groupPoints[a].lastInGroup))) {

                    // connect current item to the next one
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[a + 1].x, y: groupPoints[a + 1].y, id: groupPoints[a + 1].id}
                    });
                }

                //this basically means just a single item in the top level group
                if ((groupPoints[a].itemLevel == 1) && (groupPoints[a].firstInGroup) && (groupPoints[a].lastInGroup)) {

                    //current item connect to start node
                    groupConnections.push({
                        source: {x: groupPoints[0].x, y: groupPoints[0].y, id: groupPoints[0].id},
                        target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                    });

                    //current item connect to end node
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[groupPoints.length - 1].x, y: groupPoints[groupPoints.length - 1].y, id: groupPoints[groupPoints.length - 1].id}
                    });
                }


                //if multiple items in a level 1 'and' group, this connects the inner items.
                if ((groupPoints[a].groupKind == _and_) && (groupPoints[a].itemLevel == 1) && (groupPoints[a].indexInGroup == groupPoints[b].indexInGroup - 1) ) {

                    //current item connect to prev node
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[b].x, y: groupPoints[b].y, id: groupPoints[b].id}
                    });
                }


                if ((groupPoints[a].groupKind == _and_) && (groupPoints[a].itemLevel == 1) && (groupPoints[a].firstInGroup)) {

                    //current item connect to start node
                    groupConnections.push({
                        source: {x: groupPoints[0].x, y: groupPoints[0].y, id: groupPoints[0].id},
                        target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                    });
                }

                if ((groupPoints[a].groupKind == _and_) && (groupPoints[a].itemLevel == 1) && (groupPoints[a].lastInGroup)) {
                    //current item connect to end node
                    groupConnections.push({
                        source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                        target: {x: groupPoints[groupPoints.length - 1].x, y: groupPoints[groupPoints.length - 1].y, id: groupPoints[groupPoints.length - 1].id}
                    });

                }


                if ((groupPoints[a].parentGroupKind == _and_) && (groupPoints[a].groupKind == _or_) && (groupPoints[a].itemLevel == 2)) {

                    if ((groupPoints[b].groupKind == _and_) && (groupPoints[b].itemLevel == 1) && (groupPoints[b].indexInGroup == (groupPoints[a].indexInParentGroup + 1))) {
                        groupConnections.push({
                            source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                            target: {x: groupPoints[b].x, y: groupPoints[b].y, id: groupPoints[b].id}
                        });
                    }


                    if ((groupPoints[b].groupKind == _and_) && (groupPoints[b].itemLevel == 1) && (groupPoints[b].indexInGroup == (groupPoints[a].indexInParentGroup - 1))) {
                        groupConnections.push({
                            source: {x: groupPoints[b].x, y: groupPoints[b].y, id: groupPoints[b].id},
                            target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                        });
                    }


                    if (groupPoints[a].lastInParentGroup) {
                        //current item connect to end node
                        groupConnections.push({
                            source: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id},
                            target: {x: groupPoints[groupPoints.length - 1].x, y: groupPoints[groupPoints.length - 1].y, id: groupPoints[groupPoints.length - 1].id}
                        });
                    }

                    if (groupPoints[a].firstInParentGroup) {
                        //current item connect to end node
                        groupConnections.push({
                            source: {x: groupPoints[0].x, y: groupPoints[0].y, id: groupPoints[0].id},
                            target: {x: groupPoints[a].x, y: groupPoints[a].y, id: groupPoints[a].id}
                        });
                    }

                }
            }

        } //end: make connections


        points_connections.push(
            {
                //add a 'clone' of the object to the global array. using the json methods is an easy way to make a clone
              points: JSON.parse(JSON.stringify(groupPoints)),
              connections: JSON.parse(JSON.stringify(groupConnections))
            }
        );

    }

    return points_connections;

};




/**
 * Draw the visualization, based on the coordinate calculations.  You can customize anything in this function to suit
 * your needs. Use whatever shapes, paths, etc. you want to represent the various entities.
 * */
WaterValveChart.prototype.render = function(config) {

    var i = 0;
    var j = 0;
    var me = this;
    var data = me.getLayout();
    
    //determine the overall evaluation result for a group, whether true or false.
    //requires that each individual element contain an evaluation result of itself.
    function findGroupEvalResult(groupIdx) {

        var result;
        var tmpResult = true;
        var tmpResult2 = true;
        var j = 0;
        var k = 0;


        //currently this is the only option supported.
        if (me.cfg.data[0] == "and") {

            result = true;

            if (Array.isArray(me.cfg.data[groupIdx])) {

                //init
                if (me.cfg.data[groupIdx][0] == "and") { tmpResult = true; }
                if (me.cfg.data[groupIdx][0] == "or") { tmpResult = false; }

                for (j = 1; j < me.cfg.data[groupIdx].length; j++) {

                    if (Array.isArray(me.cfg.data[groupIdx][j])) {

                        //init
                        if (me.cfg.data[groupIdx][j][0] == "and") { tmpResult2 = true; }
                        if (me.cfg.data[groupIdx][j][0] == "or") { tmpResult2 = false; }

                        for (k = 1; k < me.cfg.data[groupIdx][j].length; k++) {

                            if (me.cfg.data[groupIdx][j][k][me.cfg.evaluationResultField] != undefined) {

                                if (me.cfg.data[groupIdx][j][0] == "and") {
                                    tmpResult2 = tmpResult2 && me.cfg.data[groupIdx][j][k][me.cfg.evaluationResultField];
                                }

                                if (me.cfg.data[groupIdx][j][0] == "or") {
                                    tmpResult2 = tmpResult2 || me.cfg.data[groupIdx][j][k][me.cfg.evaluationResultField];
                                }
                            }
                        }

                        if (me.cfg.data[groupIdx][0] == "and") { tmpResult = tmpResult && tmpResult2; }
                        if (me.cfg.data[groupIdx][0] == "or") { tmpResult = tmpResult || tmpResult2; }

                    } else {

                        if (me.cfg.data[groupIdx][j][me.cfg.evaluationResultField] != undefined) {

                            if (me.cfg.data[groupIdx][0] == "and") {
                                tmpResult = tmpResult && me.cfg.data[groupIdx][j][me.cfg.evaluationResultField];
                            }

                            if (me.cfg.data[groupIdx][0] == "or") {
                                tmpResult = tmpResult || me.cfg.data[groupIdx][j][me.cfg.evaluationResultField];
                            }

                        }
                    }
                }

                result = result && tmpResult;

                //if top level group is not an array, but just a single item.
            } else {

                console.log(me.cfg.data[groupIdx].label);
                console.log(me.cfg.data[groupIdx][me.cfg.evaluationResultField]);

                if (me.cfg.data[groupIdx][me.cfg.evaluationResultField] != undefined) {
                    console.log("!undefined");
                    result = result && me.cfg.data[groupIdx][me.cfg.evaluationResultField]
                }

                console.log(result);
            }

        }

        if (me.cfg.data[0] == "or") {

            result = false;
        }


        return result;

    }

    //find the evauation result of a single rule. The ID value will be the internally generated id from the wave graph.
    // We'll need to use that to find the source object and the eval result of the source.
    //need to call findGroupEvalResult before this method
    function findEvalResult(id) {

        var result = false;
        var i = 0;
        var j = 0;

        for (i = 0; i < data.length; i++) {

            for (j = 0; j < data[i].points.length; j++) {
                if (data[i].points[j].id == id) {
                    result = data[i].points[j].value ? data[i].points[j].value[me.cfg.evaluationResultField] ? true : false : false;
                    if (i > 0) {
                        if ( data[i].points[j].groupStartMarker && data[i-1].groupEvaluationResult) { result = true;}
                    } else {

                        //if first group then always highlight start marker path.
                        if ( data[i].points[j].groupStartMarker) { result = true;}
                    }

                    break;
                }
            }
        }

        return result;
    }



    if (me.cfg.highlightExecutionPath) {
        //add in the overall group evaluation result, whether true or false.
        //assumption is that the layout returned by wave graph fn has groups that match original input data in order and count
        for (i = 0; i < data.length; i++) {

            var _tmpEval = findGroupEvalResult(i + 1);
            data[i].groupEvaluationResult = _tmpEval; //remember we must account for the first item in the input array being the operator and/or

            if (i > 0) { data[i].previousGroupEvaluationResult =  data[i - 1].groupEvaluationResult}

            for (j = 0; j < data[i].points.length; j++) {
                data[i].points[j].groupEvaluationResult = _tmpEval;
                if (i > 0) { data[i].points[j].previousGroupEvaluationResult =  data[i - 1].groupEvaluationResult}
            }
        }
    }

    console.log(JSON.stringify(data, null, 3));

    var width = (data.length) * me.cfg.groupSize + (me.cfg.pad * 2);
    var height = me.cfg.groupSize + (me.cfg.pad * 2);

    var svg = d3.select(me.cfg.containerSelector)
        .append("svg")
        //   .style("border", "1px solid #e3e3e3")
        .attr("width", me.cfg.graphDirection == "horizontal" ? width : height)
        .attr("height", me.cfg.graphDirection == "horizontal" ? height : width);

    svg.append('defs').selectAll('marker')
        .data(['end'])      // Different link/path types can be defined here
        .enter().append('marker')    // This section adds in the arrows
        .attr('id', String)
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 43)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('fill', '#acacac')
        .attr('d', 'M0,-10L25,0L0,10');

    var groups = svg.selectAll(".group")
        .data(data)
        .enter()
        .append("g")
        .classed("group", true)
        .classed("group-actionable", me.cfg.onGroupClick != null)
        .on("click", me.cfg.onGroupClick)
        .attr("transform", function(d, i) {

            var result = "";
            if (me.cfg.graphDirection == "horizontal") {
                result = "translate(" + ((me.cfg.groupSize)*i + me.cfg.pad) + "," + ((me.cfg.groupSize/2) + (me.cfg.pad ) ) + ")";
            }

            if (me.cfg.graphDirection == "vertical") {
                result = "rotate(90 " + ((me.cfg.groupSize/2) + (me.cfg.pad ) ) + " " + (((me.cfg.groupSize*i) + (me.cfg.pad ) )) +") translate(" + ((me.cfg.groupSize/2) + (me.cfg.pad ) ) + "," + (((me.cfg.groupSize*i) + (me.cfg.pad ) )) + ")";
            }

            return result;
        });


    /* //just for testing the group eval results
     if (me.cfg.highlightExecutionPath) {
     groups
     .append("text")
     .classed("eval-result", true)
     .attr("x", 5)
     .attr("y", me.cfg.groupSize / 2 * -1 + 20)
     .text(function (d) {
     console.log(d);
     return d.groupEvaluationResult
     });
     }
     */

    groups
        .append("rect")
        .classed("group-shape", true)
        .attr("x", 0)
        .attr("y", -(me.cfg.groupSize / 2))
        .attr("width", me.cfg.groupSize)
        .attr("height", me.cfg.groupSize)
        .attr("rx", 7)
        .attr("ry", 7);


    groups
        .selectAll("path")
        .data(function(d) { return d.connections; })
        .enter()
        .append("path")
        .attr("d", function(d, i) { return me.drawDiagLeftRight(d); } )
        .attr("stroke", function(d, i) { return me.cfg.highlightExecutionPath ? findEvalResult(d.source.id) ? me.cfg.highlightColor : "#cacaca" : "#cacaca"; })
        //.attr("stroke-width", function(d, i) { return me.cfg.highlightExecutionPath ? findEvalResult(d.source.id) ? 2 : 1 : 1; })
        //.attr("stroke", function(d, i) { return "#acacac"; })
        .attr("stroke-width", function(d, i) { return 2; })
        .attr("fill", "none")
    // .attr('marker-end', 'url(#end)');

    groups.selectAll(".group-item")
        .data(function(d) { return d.points;})
        .enter()
        .append("circle")
        .classed("item-actionable", me.cfg.onItemClick != null)
        .on("click", me.cfg.onItemClick)
        .classed("group-item", true)
        .attr("cx", function(d, i) { return d.x })
        .attr("cy", function(d, i) { return d.y })
        .attr("r", function(d, i) { return (d.groupStartMarker || d.groupEndMarker) ? 3 : 8})
        .attr("fill", function(d, i) { return (d.groupStartMarker || d.groupEndMarker) ? (d.groupEvaluationResult || (d.groupStartMarker && d.previousGroupEvaluationResult)) ? me.cfg.highlightColor : "#dedede" : "#ffffff"})
        .attr("stroke", function(d, i) { return (d.groupStartMarker || d.groupEndMarker) ? (d.groupEvaluationResult || (d.groupStartMarker && d.previousGroupEvaluationResult)) ?  me.cfg.highlightColor : "#dedede" : "#999999"})
        .attr("stroke-width", function(d, i) { return d.value ? (d.value[me.cfg.evaluationResultField] != undefined) ? (d.value[me.cfg.evaluationResultField]) ? 1 : 2 : 2 : 2})
.on("mouseover", function(d, i) {
        d3.select(this).transition()
            .ease(d3.easeElastic)
            .duration(500)
            .attr("r", 15);

        d3.select(this.parentNode).selectAll("text").classed("node-label-hover", true);

    })
    .on("mouseout", function(d, i) {
        d3.select(this).transition()
            .duration(200)
            .attr("r", 8);

        d3.select(this.parentNode).selectAll("text").classed("node-label-hover", false);

    });
        ;



    //visually represent the true/false results of each rule that has an eval result. places symbology on/in each node. uses a dial indicator alignment type of visualization.
    if (me.cfg.highlightExecutionPath) {
        groups.selectAll(".group-item-result")
            .data(function(d) { return d.points;})
            .enter()
            .append("line")
            .filter(function(d) { return (!d.groupStartMarker) && (!d.groupEndMarker) && (d.value[me.cfg.evaluationResultField] != undefined); })
            .classed("group-item-result", true)
            .attr("x1", function(d, i) { return d.value[me.cfg.evaluationResultField] ? d.x - 8 : d.x})
            .attr("y1", function(d, i) { return d.value[me.cfg.evaluationResultField] ? d.y : d.y - 8 })
            .attr("x2", function(d, i) { return d.value[me.cfg.evaluationResultField] ? d.x + 8 : d.x })
            .attr("y2", function(d, i) { return d.value[me.cfg.evaluationResultField] ? d.y : d.y + 8})
            .attr("stroke", function(d, i) { return me.cfg.highlightColor})
            .attr("stroke-width", 2);
    }


    groups.selectAll(".node-label")
        .data(function(d) {  return d.points;})
        .enter()
        .append("text")
        .classed("node-label", true)
        .attr("x", function(d, i) { return d.x })
        //when the graph is vertical, and in an 'or' group, then we'll alternate label placement to prevent text overlapping
        .attr("y", function(d, i) { return (me.cfg.graphDirection == "vertical" && d.groupKind == "or") ? (i % 2 == 0) ? d.y + 10 : d.y - 10 : d.y - 10})
        .attr("transform", function(d, i) { return me.cfg.graphDirection == "vertical" ? "rotate(-90 " + (d.x - 3) + " " + (d.y-9) + ")" : ""; })
        .text(function(d, i) { return d.value ? d.value.label ? d.value.label : d.value : d.value; } )


    return me.generateStatement();

};


