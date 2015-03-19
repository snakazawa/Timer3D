(function (global) {
    global.Numeric2D = global.Numeric2D || (function () {
        var vertexes = [
            {x: 0, y: 2},
            {x: 0, y: 1},
            {x: 0, y: 0},
            {x: 1, y: 2},
            {x: 1, y: 1},
            {x: 1, y: 0}
        ], edges = [  // vertex indexes
            [0, 3],
            [1, 4],
            [2, 5],
            [1, 0],
            [2, 1],
            [4, 3],
            [5, 4]
        ], nums = [ // edge indexes
            [0, 5, 6, 2, 4, 3],
            [5, 6],
            [0, 5, 1, 4, 2],
            [0, 5, 1, 6, 2],
            [3, 1, 5, 6],
            [0, 3, 1, 6, 2],
            [3, 1, 4, 6, 2],
            [0, 5, 6],
            [0, 1, 2, 3, 4, 5, 6],
            [0, 3, 1, 5, 6, 2]
        ], colonVertexes = [
            {x: 0.5, y: 0.5},
            {x: 0.5, y: 1.5}
        ];

        function Numeric2D (width, height, bold, offsetX, offsetY) {
            var verticalLine = height / 2,
                horizontalLine = width,
                halfBold = bold / 2,
                vs, es, colons;

            offsetX = offsetX || 0;
            offsetY = offsetY || 0;

            vs = vertexes.map(function (vertex) {
                return {
                    x: vertex.x * horizontalLine + offsetX,
                    y: vertex.y * verticalLine + offsetY
                };
            });

            es = edges.map(function (edge) {
                var i = edge[0], j = edge[1];

                return {
                    x1: vs[i].x - halfBold,
                    y1: vs[i].y - halfBold,
                    x2: vs[j].x + halfBold,
                    y2: vs[j].y + halfBold
                };
            }, this);

            colons = colonVertexes.map(function (vertex) {
                return {
                    x: vertex.x * horizontalLine + offsetX,
                    y: vertex.y * verticalLine + offsetY
                };
            });

            this.vertexes = vs;
            this.edges = es;
            this.colons = colons;
            this.bold = bold;
        }

        // num is 0-index ( range: 0~9 ) or -1 (colon)
        Numeric2D.prototype.isInnerPoint = function(x, y, num) {
            if (num < -1 || num >= num.length) { return false; }
            if (num === -1) { return this.isInnerPointColon(x, y); }

            return nums[num].some(function (edgeIndex) {
                var e = this.edges[edgeIndex];
                return isInnerEdge(x, y, e.x1, e.y1, e.x2, e.y2);
            }, this);
        };

        Numeric2D.prototype.isInnerPointColon = function (x, y) {
            return isInnerCircle(x, y, this.colons[0].x, this.colons[0].y, this.bold) ||
                   isInnerCircle(x, y, this.colons[1].x, this.colons[1].y, this.bold);
        };

        // (x, y) in ((x1, y1)~(x2, y2))
        function isInnerEdge(x, y, x1, y1, x2, y2) {
            return x1 <= x && x <= x2 &&
                   y1 <= y && y <= y2;
        }

        function isInnerCircle(x, y, x0, y0, r) {
            return (x - x0) * (x - x0) + (y - y0) * (y - y0) <= r * r;
        }

        return Numeric2D;

    }());
}(window));