round = function( x, n )
{
    return Math.round( x * ( 10 ^ n ) ) / ( 10 ^ n );
}

describe( "TPS Core", function()
{
    var src = [ [ 3.6929, 10.3819 ], [ 6.5827, 8.8386 ], [ 6.7756, 12.0866 ], [ 4.8189, 11.2047 ], [ 5.6969, 10.0748 ] ]
    var dst = [ [ 3.9724, 6.5354 ], [ 6.6969, 4.1181 ], [ 6.5394, 7.2362 ], [ 5.4016, 6.4528 ], [ 5.7756, 5.1142 ] ]

    var g = {
        src: src,
        dst: dst,
        
        linear: [ [  1.354995817737054,     -2.945963080998404  ],
                  [  0.874725874866678,     -0.2955605626378657 ],
                  [ -0.028860413349610394,   0.9216325921181693 ]
        ],
        
        scale: 0.8931102258056604,
        shearing: 249.53683693462318,
        mirror: false,

        weights: [ [ -0.03803013535431951,   0.04244692805941587  ],
                   [  0.023187750609017302,  0.015916611769884625 ],
                   [ -0.024755055674439894,  0.028813480594372286 ],
                   [  0.07978225761219288,  -0.04542552119379922  ],
                   [ -0.0401848171924508,   -0.041751499229873576 ]
        ],
        
        be: 0.042999489580598765,
    };
    
    it( "TPS_generate", function()
    {
        expect( TPS_generate( src, dst ) ).toEqual( g );
    } );
    
    it( "TPS_project: Array or separate x, y call", function()
    {
        var arr = TPS_project( g, src[ 0 ] );
        var sep = TPS_project( g, src[ 0 ][ 0 ], src[ 0 ][ 1 ] );
        
        expect( arr ).toEqual( sep );
        
    });
    
    it( "TPS_project: src ~> dst", function()
    {
        for( var i = 0; i < src.length; i++ )
        {
            var exp_px = dst[ i ][ 0 ]
            var exp_py = dst[ i ][ 1 ];
            
            var p = TPS_project( g, src[ i ] );
            var px = p[ 0 ];
            var py = p[ 1 ];
            
            expect( round( px, 5 ) ).toEqual( round( exp_px, 5 ) );
            expect( round( py, 5 ) ).toEqual( round( exp_py, 5 ) );
        }
    } );
} );
