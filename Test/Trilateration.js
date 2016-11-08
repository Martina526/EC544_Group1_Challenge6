var math = require('mathjs');

var x = math.matrix([x1,x2,x3,x4]),
    y = math.matrix([y1,y2,y3,y4]);
var d = math.matrix([d1,d2,d3,d4]);
var d_combination = math.matrix([d1,d2,d3],[d2,d3,d4],[d1,d3,d4],[d1,d2,d4]);
// push d1, d2, d3, d4 to d;
// push beacon1/2/3/4 location to x and y
var x = 0, 
    y = 0;
for(int i = 0; i < 4; i ++){
    var matrix1 = math.matrix([[x[0]-x[1],y[0]-y[2]],[x[1]-x[2],y[1]-y[2]]]);
    matrix2 = math.matrix([x[0]^2-x[2]^2+y[0]^2-y[2]^2-d_combination[i][0]^2+d_combination[i][2]^2,x[1]^2-x[2]^2+y[1]^2-y[2]^2-d_combination[i][1]^2+d_combination[i][2]^2]);

    var position = 2*math.multiply(math.inv(matrix1), matrix2);
    x = x + postion[0];
    y = y + postion[1];
}
x = x/4;
y = y/4;


/*
matrix1[0] = [];
matrix1[1] = [];
matrix1[0][0] = x[0]-x[1];
matrix1[0][1] = y[0]-y[2];
matrix1[1][0] = x[1]-x[2];
matrix1[1][1] = y[1]-y[2];
matrix2[0] = x[0]^2-x[2]^2+y[0]^2-y[2]^2-d[0]^2+d[2]^2;
matrix2[1] = x[1]^2-x[2]^2+y[1]^2-y[2]^2-d[1]^2+d[2]^2;
*/
