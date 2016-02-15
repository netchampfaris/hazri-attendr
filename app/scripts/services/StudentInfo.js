'use strict';

/**
 * @ngdoc service
 * @name Hazri.StudentInfo
 * @description
 * # StudentInfo
 *
 */
angular.module('Hazri')
    .factory('StudentInfo', function ($q, _, $localStorage) {

        return {
            get: function (options) {
                var defer = $q.defer();
                //console.log(options);
                var hazridata = $localStorage.hazridata;
                var students = hazridata.students[options.dept.id];
                var studentCount = hazridata.studentCount[options.dept.id];
                var tStudents = parseInt(studentCount[options.dept.id + '-' + options.year.id]['count']);
                if (options.type.id == 'pr') {
                    var batchno = options.batch;
                    var bStart = parseInt(studentCount[options.dept.id + '-' + options.year.id]['batchno'][batchno]);
                    var bEnd = parseInt(studentCount[options.dept.id + '-' + options.year.id]['batchno'][batchno + 1] - 1) || tStudents;
                    var studentsData = _.filter(students, function (n) {
                        return parseInt(n.rollno) >= bStart && parseInt(n.rollno) <= bEnd && n.year == options.year.id;
                    });
                }
                else
                    var studentsData = _.filter(students, { 'year': options.year.id });

                var result = {
                    selected: options,
                    students: studentsData,
                    batchno: batchno || null,
                    batchStart: bStart || null,
                    batchEnd: bEnd || null,
                    totalStudents: tStudents
                };
                defer.resolve(result);

                return defer.promise;
            }
        }

    });

