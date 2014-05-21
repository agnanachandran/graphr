angular.module('GraphService', []).factory('Graph', ['$http', function($http) {
    
    return {
        // call to get all graphs
        get: function(graphName) {
            return $http.get('/graphs/' + graphName);
        },

        getAll: function() {
            return $http.get('/graphs/');
        },

        create: function(graphData) {
            return $http.post('/graphs/', graphData);
        }

        //delete: function(id) {
            //return $http.delete('/api/graphs/' + id);
        //}
    };

}]);
