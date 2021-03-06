/*
 * Matrix dot product
 */
dot = function( a, b )
{
    var n = a.length;
    var m = b.length;
    var p = b[ 0 ].length;
    
    var ret = createArray( n, p );
    for( var i = 0; i < n; i++ )
    {
        for( var j = 0; j < p; j++ )
        {
            var sum = 0;
            for( var k = 0; k < m; k++ )
                sum += a[ i ][ k ] * b[ k ][ j ];
            
            ret[ i ][ j ] = sum;
        }
    }
    
    return ret;
}

/*
 * Transpose matrix
 */
function transpose( m )
{
    var ret = createArray( m[ 0 ].length, m.length );
    
    for( var i = 0; i < m[ 0 ].length; i++ )
        for( var j = 0; j < m.length; j++ )
            ret[ i ][ j ] = m[ j ][ i ];
    
    return ret;
}

/*
 * Solve a linear system of equations by Gaussian elimination.
 * Based on:
 *      https://martin-thoma.com/solving-linear-equations-with-gaussian-elimination/
 */
function solve( A, b )
{
    if( typeof( b[ 0 ] ) != "number" )
    {
        var ret = Array();
        
        for( var i = 0; i < b[ 0 ].length; i++ )
        {
            var tmp = Array();
            for( var j = 0; j < b.length; j++ )
                tmp.push( b[ j ][ i ] );
            
            ret.push( solve( A, tmp ) );
        }
        
        return transpose( ret );
    
    } else {
        var n = A.length;
        var A_aug = createArray( n, n + 1 );
        
        for( var i = 0; i < n; i++ )
        {
            for( var j = 0; j < n; j++ )
                A_aug[ i ][ j ] = A[ i ][ j ];
            A_aug[ i ][ n ] = b[ i ];
        }
        
        for( var i = 0; i < n; i++ )
        {
            // Search for maximum in this column
            var max_value = 0
            var max_row = null;
            
            for( var k = i; k < n; k++ )
            {
                var current_max_value = Math.abs( A_aug[ k ][ i ] );
                
                if( current_max_value > max_value )
                {
                    max_value = current_max_value;
                    max_row = k;
                }
            }
            
            // Swap maximum row with current row (column by column)
            for( var k = i; k < n + 1; k++ )
            {
                var tmp = A_aug[ i ][ k ];
                A_aug[ i ][ k ] = A_aug[ max_row ][ k ];
                A_aug[ max_row ][ k ] = tmp;
            }
            
            // Make all rows below this one 0 in current column
            for( k = i + 1; k < n; k++ )
            {
                var c = -A_aug[ k ][ i ] / A_aug[ i ][ i ];
                for( var j = i; j < n + 1; j++ )
                {
                    if( i == j )
                        A_aug[ k ][ j ] = 0;
                    else
                        A_aug[ k ][ j ] += c * A_aug[ i ][ j ];
                }
            }
        }
        
        // Solve equation Ax=b
        var x = new Array( n );
        for( var i = n - 1; i > -1; i-- )
        {
            x[ i ] = A_aug[ i ][ n ] / A_aug[ i ][ i ];
            for( var k = i - 1; k > -1; k-- )
                A_aug[ k ][ n ] -= A_aug[ k ][ i ] * x[ i ];
        }
        return x;
    }
}

/*
 * Matrix allocation. This function allow to create a multi-dimentional Array().
 */
function createArray( length )
{
    var arr = new Array( length || 0 );
    var i = length;
    if( arguments.length > 1 )
    {
        var args = Array.prototype.slice.call( arguments, 1 );
        while( i-- )
            arr[ length - 1 - i ] = createArray.apply( this, args );
    }
    return arr;
}

/*
 * Unit vector
 */
function unit_vector( vector )
{
    var n = vector.length;
    
    var norm = 0;
    for( var i = 0; i < n; i++ )
        norm += vector[ i ] * vector[ i ];
    norm = Math.sqrt( norm );
    
    var r = new Array();
    for( var i = 0; i < n; i++ )
        r[ i ] = vector[ i ] / norm;
    
    return r;
}

/*
 * angle_between
 */
function angle_between( v1, v2, deg )
{
    var v1_u = unit_vector( v1 );
    var v2_u = unit_vector( v2 );
    
    var d = 0;
    for( var i = 0; i < v1_u.length; i++ )
        d += v1_u[ i ] * v2_u[ i ];
    
    var angle = Math.acos( d );
    
    if( v1_u[ 1 ] < 0 )
        angle = 2 * Math.PI - angle;
    
    angle = angle % ( 2 * Math.PI );
    
    if( deg !== "undefined" && !deg )
        return angle;
    else
        return angle / Math.PI * 180; 
    
    return angle;
}

/*
 * Functions defined in the publication of Bookstein (1989). The original
 * function U is not realy used here because of performance issues. Since the U
 * function is used for the K matrix, the sqrt() present in the distance
 * function is simplified with the ^2. The euclidean distance being neved used
 * elsewhere, it's not present in the TPS library.
 */
function U( r )
{
    return U2( r * r );
}

function U2( r )
{
    if( r == 0 )
        return 0;
    else
        return r * Math.log( r );
}

/*
 * The generate function allow to calculate the TPS parameters of the
 * distortion. The parameters 'src' (source of the transoformation) and 'dst'
 * (destination points) are mendatory.
 */
function TPS_generate( src, dst )
{
    var n = src.length;
    
    // K Matrix
    var K = createArray( n, n );
    
    for( var i = 0; i < n; i++ )
    {
        for( var j = 0; j < n; j++ )
        {
            var dx = src[ j ][ 0 ] - src[ i ][ 0 ];
            var dy = src[ j ][ 1 ] - src[ i ][ 1 ];
            K[ i ][ j ] = U2( dx * dx + dy * dy );
        }
    }
    
    // L Matrix
    var L = createArray( n + 3, n + 3 );
    
    for( var i = 0; i < n; i++ )
        for( var j = 0; j < n; j++ )
            L[ i ][ j ] = K[ i ][ j ]

    for( var i = 0; i < n; i++ )
    {
        L[ i ][ n ] = 1;
        L[ i ][ n + 1 ] = src[ i ][ 0 ];
        L[ i ][ n + 2 ] = src[ i ][ 1 ];
        
        L[ n ][ i ] = 1;
        L[ n + 1 ][ i ] = src[ i ][ 0 ];
        L[ n + 2 ][ i ] = src[ i ][ 1 ];
    }
    
    for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 3; j++ )
            L[ n + i ][ n + j ] = 0;
    
    // V Matrix
    var V = createArray( n + 3, 2 );
    
    for( var i = 0; i < n; i++ )
        for( var j = 0; j < 2; j++ )
            V[ i ][ j ] = dst[ i ][ j ];
    
    for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ )
            V[ i + n ][ j ] = 0;
    
    // Solve
    Wa = solve( L, V );
    
    var W = createArray( n, 2 );
    for( var i = 0; i < n; i++ )
        for( var j = 0; j < 2; j++ )
            W[ i ][ j ] = Wa[ i ][ j ];
    
    var a = createArray( 3, 2 );
    for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ )
            a[ i ][ j ] = Wa[ i + n ][ j ];
    
    // Other calculations
    
    var WKW = dot( dot( transpose( W ), K ), W );
    var be = 0.5 * ( WKW[ 0 ][ 0 ] + WKW[ 1 ][ 1 ]  );
    
    var surfaceratio = ( a[ 1 ][ 0 ] * a[ 2 ][ 1 ] ) - ( a[ 2 ][ 0 ] * a[ 1 ][ 1 ] );
    var scale = Math.sqrt( Math.abs( surfaceratio ) );
    
    var mirror = surfaceratio < 0 ? true : false;
    
    var shearing = angle_between( [ a[ 1 ][ 0 ], a[ 1 ][ 1 ] ], [ a[ 2 ][ 0 ], a[ 2 ][ 1 ] ], true );
    
    // Return
    return {
        src: src,
        dst: dst,
        linear: a,
        scale: scale,
        mirror: mirror,
        shearing: shearing,
        weights: W,
        be: be,
    };
}

/*
 * Projection function. This function take as parameter the 'g' TPS parameters
 * (see the 'generate' function), and the 'x' and 'y' coordinates of the point
 * to project.
 */
function TPS_project( g, x, y )
{
    // vars
    var n = g[ 'src' ].length
    
    if( typeof( y ) === "undefined" )
    {
        var y = x[ 1 ];
        var x = x[ 0 ];
    }
    
    var xy = new Array();
    xy[ 0 ] = 1;
    xy[ 1 ] = x;
    xy[ 2 ] = y;
    
    // Linear part -- dot( hstack( ( 1, XY ) ), linear )
    var p = new Array();
    for( var i = 0; i < 2; i++ )
    {
        var tmp = 0;
        for( var j = 0; j < 3; j++ )
            tmp += xy[ j ] * g[ 'linear' ][ j ][ i ];
        
        p[ i ] = tmp;
    }
    
    // Distance with the src vector
    var dist = new Array();
    for( var i = 0; i < n; i++ )
    {
        var tmp = 0;
        // sum( ( src - XY ) ** 2
        for( var j = 0; j < 2; j++ )
            tmp += Math.pow( ( g[ 'src' ][ i ][ j ] - xy[ j + 1 ] ), 2 );
        
        // U2
        dist[ i ] = U2( tmp );
    }
    
    // Non-linear part -- dot( ... , W )
    for( var i = 0; i < 2; i++ )
        for( var j = 0; j < n; j++ )
            p[ i ] += dist[ j ] * g[ 'weights' ][ j ][ i ];
    
    // Return
    return p;
}
