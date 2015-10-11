var arrNodes = [
        {id: 1, label: 'Req 00', group: 'group1'},
        {id: 2, label: 'Req 01', group: 'group2'},
        {id: 3, label: 'Req 02', group: 'group1'},
        {id: 4, label: 'Req 03', group: 'group1'},
        {id: 5, label: 'Req 04', group: 'group2'},
        {id: 6, label: 'Req 05', group: 'group2'},
        {id: 7, label: 'Req 06', group: 'group2'},
        {id: 8, label: 'Req 07', group: 'group2'},
        {id: 9, label: 'Req 08', group: 'group2'},
        {id: 10, label: 'Req 09', group: 'group2'},
        {id: 11, label: 'Req 10', group: 'group2'},
        {id: 12, label: 'Req 11', group: 'group1'},
        {id: 13, label: 'Req 12', group: 'group1'},
        {id: 14, label: 'Req 13', group: 'group3'},
        {id: 15, label: 'Req 14', group: 'group3'},
        {id: 16, label: 'Req 15', group: 'group3'},
        {id: 17, label: 'Req 16', group: 'group3'},
        {id: 18, label: 'Req 17', group: 'group3'},
        {id: 19, label: 'Req 18', group: 'group3'}

    ];

var arrEdges = [
        {from: 1, to: 5},
        {from: 2, to: 8},
        {from: 3, to: 4},
        {from: 4, to: 5},
        {from: 5, to: 6},
        {from: 6, to: 7},
        {from: 7, to: 8},
        {from: 9, to: 10},
        {from: 10, to: 11},
        {from: 13, to: 14},
        {from: 14, to: 15},
        {from: 15, to: 14},
        {from: 15, to: 16},
        {from: 16, to: 17},
        {from: 17, to: 16},
        {from: 18, to: 19}
    ];

var nodes = null;
var edges = null;
var network = null;
// create some nodes and edges
var data = {nodes:arrNodes, edges:arrEdges};
// cluster variables
var clusterIndex = 0;
var clusters = [];
var lastClusterZoomLevel = 0;
var clusterFactor = 0.9;


function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw() {
  destroy();
  nodes = [];
  edges = [];

  // create a network
  var container = document.getElementById('mynetwork');
  var options = {
        nodes: {
            shape: 'circle',
            borderWidth: 2,
            borderWidthSelected: undefined,
            size: 10,
            color: {
                border: '#000000'
            },
            font: {
                size: 24
            },
            scaling: {
                min: 10,
                max: 65
            }
        },
        groups: {
            useDefaultGroups: true,
            group1: {
                color: '#FF0000'
            },
            group2: {
                color: '#006600'
            },
            group3: {
                color: '#0066FF'
            }
        },
        edges: {
            arrows: {
                to: {enabled: true},
                middle: {enabled: false},
                from: {enabled: true}
            },
            length: 200

        },
        manipulation: {
            enabled: true,
            editNode: function (data, callback) {
                document.getElementById('operation').innerHTML = "Edit Node";
                document.getElementById('node-color').value = data.color.background;
                document.getElementById('node-size').value = data.size;
                document.getElementById('font-size').value = data.font.size;
                document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
                document.getElementById('cancelButton').onclick = cancelEdit.bind(this, callback);
                document.getElementById('network-popUp').style.display = 'block';
            },
            deleteNode: true,
            editEdge: true,
            deleteEdge: true
        }

  };
  network = new vis.Network(container, data, options);

    // set the first initial zoom level
    network.once('initRedraw', function() {
        if (lastClusterZoomLevel === 0) {
            lastClusterZoomLevel = network.getScale();
        }
    });

    // we use the zoom event for our clustering
    network.on('zoom', function (params) {
        if (params.direction == '-') {
            if (params.scale < lastClusterZoomLevel*clusterFactor) {
                makeClusters(params.scale);
                lastClusterZoomLevel = params.scale;
            }
        }
        else {
            openClusters(params.scale);
        }
    });

    // if we click on a node, we want to open it up!
    network.on("selectNode", function (params) {
        if (params.nodes.length == 1) {
            if (network.isCluster(params.nodes[0]) == true) {
                network.openCluster(params.nodes[0])
            }
        }
    });
}

function clearPopUp() {
  document.getElementById('saveButton').onclick = null;
  document.getElementById('cancelButton').onclick = null;
  document.getElementById('network-popUp').style.display = 'none';
}

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}

// save the modified node value
function saveData(data,callback) {
    data.color = document.getElementById('node-color').value;
    data.size = document.getElementById('node-size').value;
    data.font.size = document.getElementById('font-size').value;
    clearPopUp();
    callback(data);
}



// make the clusters
function makeClusters(scale) {
    var clusterOptionsByData = {
        processProperties: function (clusterOptions, childNodes) {
            clusterIndex = clusterIndex + 1;
            var childrenCount = 0;
            for (var i = 0; i < childNodes.length; i++) {
                childrenCount += childNodes[i].childrenCount || 1;
            }
            clusterOptions.childrenCount = childrenCount;
            clusterOptions.label = "# " + childrenCount + "";
            clusterOptions.font = {size: childrenCount*5+30}
            clusterOptions.id = 'cluster:' + clusterIndex;
            clusters.push({id:'cluster:' + clusterIndex, scale:scale});
            return clusterOptions;
        },
        clusterNodeProperties: {borderWidth: 3, shape: 'database', font: {size: 30}}
    }
    network.clusterOutliers(clusterOptionsByData);
}

// open them back up!
function openClusters(scale) {
    var newClusters = [];
    var declustered = false;
    for (var i = 0; i < clusters.length; i++) {
        if (clusters[i].scale < scale) {
            network.openCluster(clusters[i].id);
            lastClusterZoomLevel = scale;
            declustered = true;
        }
        else {
            newClusters.push(clusters[i])
        }
    }
    clusters = newClusters;
}