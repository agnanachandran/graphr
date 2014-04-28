angular.module('GeekService', []).factory('Graph', ['$http', function($http) {
    
    return {
        // call to get all graphs
        get: function() {
            return $http.get('/api/graphs');
        },

        create: function(graphData) {
            return $http.post('/api/graphs', graphData);
        }

        //delete: function(id) {
            //return $http.delete('/api/graphs/' + id);
        //}
    }

}]);
