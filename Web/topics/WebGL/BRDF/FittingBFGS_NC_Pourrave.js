/*
 Helper fitting class implementing BFGS optimization
 http://en.wikipedia.org/wiki/BFGS_method
 */
/*o3djs.provide( 'BRDF.FittingBFGS' );
o3djs.require( 'patapi.math' );

FittingBFGS = function()
{
}

FittingBFGS.prototype =
{
	Dispose : function()
	{
	}

	, PerformFitting : function( _BRDFTarget, _BRDFPom )
	{
		// Prepare the array of luminance values from the BRDF
		var	Values = new Float32Array( 90*90 );
		var	Luminance = new vec3( 0.2126, 0.7152, 0.0722 );		// Observer. = 2°, Illuminant = D65
		var	X, Y;
		for ( Y=0; Y < 90; Y++ )
			for ( X=0; X < 90; X++ )
			{
				var	Reflectance = _BRDFTarget.sample( X, Y );
				Values[90*Y+X] = Luminance.dot( Reflectance );
			}

		// Prepare the initial coefficients (indexed from 1!)
		var	Coefficients = [];
		Coefficients[1] = _BRDFPom.exponentX;
		Coefficients[2] = _BRDFPom.falloffX;
		Coefficients[3] = _BRDFPom.amplitudeX;
		Coefficients[4] = _BRDFPom.offsetX;
		Coefficients[5] = _BRDFPom.exponentY;
		Coefficients[6] = _BRDFPom.falloffY;
		Coefficients[7] = _BRDFPom.amplitudeY;
		Coefficients[8] = _BRDFPom.offsetY;

		// Prepare our evaluation functions
		var	Goal = 0.01;
		var	Offset = 0.001;
		var	x, kx, y, ky, u, v, Cx, Cy, C, B, Diff;

		var	SumSqDifference = 0.0;
		function	Eval( _Params )
		{	// We must return the difference between current function and target BRDF
			var	Coeffs = _Params.coeffs;

			// Apply constraints
			Coeffs[1] = Math.max( 0.0, Coeffs[1] );		// Exponents can't go negative
			Coeffs[2] = Math.max( 1e-4, Coeffs[2] );	// Falloff neither
			Coeffs[3] = Math.max( 0.0, Coeffs[3] );		// Nor amplitudes

			Coeffs[5] = Math.max( 0.0, Coeffs[5] );		// Exponents can't go negative
			Coeffs[6] = Math.max( 1e-4, Coeffs[6] );	// Falloff neither
			Coeffs[7] = Math.max( 0.0, Coeffs[7] );		// Nor amplitudes

			// Prepare k
			x = Math.pow( Coeffs[2], Coeffs[1] );	// We must reach the goal at this position
			kx = Math.log( Goal / Math.max( Goal, Coeffs[3] ) ) / x;

			y = Math.pow( Coeffs[6], Coeffs[5] );	// We must reach the goal at this position
			ky = Math.log( Goal / Math.max( Goal, Coeffs[7] ) ) / y;

			SumSqDifference = 0.0;
			for ( Y=0; Y < 90; Y++ )
			{
				v = 1.0 - Y / 90.0;
				Cy = Coeffs[8] + Coeffs[7] * Math.exp( ky * Math.pow( v, Coeffs[5] ) );

				for ( X=0; X < 90; X++ )
				{
					// Pom Model
					u = X*X/8100.0;
					Cx = Coeffs[4] + Coeffs[3] * Math.exp( kx * Math.pow( u, Coeffs[1] ) );
					C = Cx * Cy - Coeffs[4] * Coeffs[8];

					// Actual BRDF
					B = Values[90*Y+X];

					Diff = C - B;
					Diff *= Diff;
					SumSqDifference += Diff;
				}
			}

			SumSqDifference /= 8100;	// Normalize
//			SumSqDifference = Math.sqrt( SumSqDifference );
			return SumSqDifference;
		}

		function	EvalGradient( _Params )
		{	// We must compute the gradient of the difference between current function and target BRDF and store the result in the vector _Params.g
			var	Coeffs = _Params.coeffs;

			var	CentralValue = _Params.functionMinimum;
			for ( var i=1; i < Coeffs.length; i++ )
			{
				var	OldCoeff = Coeffs[i];
				Coeffs[i] += Offset;
				var	OffsetValue = Eval( _Params );
				Coeffs[i] = OldCoeff;

				var	Derivative = OffsetValue - CentralValue;
					Derivative /= Offset;

				_Params.g[i] = Derivative;
			}
		}

		try
		{
			var	Params = {

 				coeffs : Coefficients,

				eval : Eval,
				evalGradient : EvalGradient,

				tolerance : 0.001,

				// Out parameters
				iterationsCount : 0,
				functionMinimum : 0,
			};

			this.dfpmin( Params );
		}
		catch ( _e )
		{
// 			CrashesCount++;
//			continue;
			window.alert( "Mais crotte !\n\n" + _e );
		}

		// Assign new parameters even if it failed (perhaps it will be better with those as a starting point)
		_BRDFPom.exponentX = Coefficients[1];
		_BRDFPom.falloffX = Coefficients[2];
		_BRDFPom.amplitudeX = Coefficients[3];
		_BRDFPom.offsetX = Coefficients[4];
		_BRDFPom.exponentY = Coefficients[5];
		_BRDFPom.falloffY = Coefficients[6];
		_BRDFPom.amplitudeY = Coefficients[7];
//		_BRDFPom.offsetY = Coefficients[8];
		_BRDFPom.setOffsetY( Coefficients[8] );	// So it gets updated...
	}

	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	, ITMAX : 200
	, EPS : 3.0e-8
	, TOLX : 12.0e-8		// 4*EPS
	, STPMX : 100.0			// Scaled maximum step length allowed in line searches.

	/// <summary>
	/// Performs BFGS function minimzation on a quadratic form function evaluated by the provided delegate
	/// </summary>
	/// <param name="_Coefficients">The array of initial coefficients (indexed from 1!!) that will also contain the resulting coefficients when the routine has converged</param>
	/// <param name="_ConvergenceTolerance">The tolerance error to accept as the minimum of the function</param>
	/// <param name="_PerformedIterationsCount">The amount of iterations performed to reach the minimum</param>
	/// <param name="_Minimum">The found minimum</param>
	/// <param name="_FunctionEval">The delegate used to evaluate the function to minimize</param>
	/// <param name="_FunctionGradientEval">The delegate used to evaluate the gradient of the function to minimize</param>
	/// <param name="_Params">Some user params passed to the evaluation functions</param>
//	dfpmin : function( var[] _Coefficients, var _ConvergenceTolerance, out var _PerformedIterationsCount, out var _Minimum, BFGSFunctionEval _FunctionEval, BFGSFunctionGradientEval _FunctionGradientEval, object _Params )
	, dfpmin : function( _Params )
	{
		var	_Coefficients = _Params.coeffs;
		var	_FunctionEval = _Params.eval;
		var	_FunctionGradientEval = _Params.evalGradient;
		var	_ConvergenceTolerance = _Params.tolerance;

		var	n = _Coefficients.length - 1;
		_Params.n = n;

		var	i,its,j;
		var	den,fac,fad,fae,sum=0.0,sumdg,sumxi,temp,test;

		InitVector = function( _Length )
		{
			var	m = [];
			for ( var i=0; i < _Length; i++ )
				m[i] = 0.0;

			return m;
		}

		InitMatrix = function( _Rows, _Columns )
		{
			var	m = [];
			for ( var i=0; i < _Rows; i++ )
			{
				m[i] = [];
				for ( var j=0; j < _Columns; j++ )
					m[i][j] = 0.0;
			}

			return m;
		}

		var	dg = InitVector(1+n);
		var	g = InitVector(1+n);
		var	hdg = InitVector(1+n);
		var	Hessian = InitMatrix( 1+n, 1+n );
		var	pnew = InitVector(1+n);
		var	xi = InitVector(1+n);

		_Params.g = g;
		_Params.xi = xi;
		_Params.pnew = pnew;

		// Initialize values
		_Params.functionMinimum = _FunctionEval( _Params );
		_FunctionGradientEval( _Params );

		for ( i=1; i <= n; i++ )
		{
			for ( j=1; j <= n; j++ )
				Hessian[i][j] = 0.0;

			Hessian[i][i] = 1.0;

			xi[i] = -g[i];
			sum += _Coefficients[i]*_Coefficients[i];
		}

		_Params.stpmax = this.STPMX * Math.max( Math.sqrt( sum ), n );
		for ( its=1; its <= this.ITMAX; its++ )
		{
			_Params.iterationsCount = its;

			// The new function evaluation occurs in linearSearch
//			this.linearSearch( n, _Coefficients, fp, g, xi, pnew, out _Minimum, stpmax, out check, _FunctionEval, _Params );
			this.linearSearch( _Params );
			_Params.functionMinimum = _Params.linearSearchMinimum;	// New minimum!

			for ( i=1; i<=n; i++ )
			{
				xi[i] = pnew[i] - _Coefficients[i];	// Update the line direction
				_Coefficients[i] = pnew[i];			// as well as the current point
			}

			// Test for convergence on Delta X
			test = 0.0;
			for ( i=1; i <= n; i++ )
			{
				temp = Math.abs( xi[i] ) / Math.max( Math.abs( _Coefficients[i] ), 1.0 );
				if ( temp > test )
					test = temp;
			}

			if ( test < this.TOLX )
				return;	// Done!

			// Save the old gradient
			for ( i=1; i <= n; i++ )
				dg[i] = g[i];

			// Get the new one
			_FunctionGradientEval( _Params );

			// Test for convergence on zero gradient
			test = 0.0;
			den = Math.max( _Params.linearSearchMinimum, 1.0 );
			for ( i=1; i <= n; i++ )
			{
				temp = Math.abs( g[i] ) * Math.max( Math.abs( _Coefficients[i] ), 1.0 ) / den;
				if ( temp > test )
					test = temp;
			}

			if ( test < _ConvergenceTolerance )
				return;	// Done!

			// Compute difference of gradients
			for ( i=1; i <= n ; i++ )
				dg[i] = g[i]-dg[i];

			// ...and difference times current hessian matrix
			for ( i=1; i <= n; i++ )
			{
				hdg[i]=0.0;
				for ( j=1; j <= n; j++ )
					hdg[i] += Hessian[i][j] * dg[j];
			}

			// Calculate dot products for the denominators
			fac = fae = sumdg = sumxi = 0.0;
			for ( i=1; i <= n; i++ )
			{
				fac += dg[i] * xi[i];
				fae += dg[i] * hdg[i];
				sumdg += dg[i] * dg[i];
				sumxi += xi[i] * xi[i];
			}

			if ( fac * fac > this.EPS * sumdg * sumxi )
			{
				fac = 1.0 / fac;
				fad = 1.0 / fae;

				// The vector that makes BFGS different from DFP
				for ( i=1; i <= n; i++ )
					dg[i] = fac * xi[i] - fad * hdg[i];

				// BFGS Hessian update formula
				for ( i=1; i <= n; i++ )
					for ( j=1; j <= n; j++ )
						Hessian[i][j] += fac * xi[i] * xi[j] -fad * hdg[i] * hdg[j] + fae * dg[i] * dg[j];
			}

			// Now, calculate the next direction to go
			for ( i=1; i <= n; i++ )
			{
				xi[i] = 0.0;
				for ( j=1; j <= n; j++ )
					xi[i] -= Hessian[i][j] * g[j];
			}
		}

		throw "Too many iterations in dfpmin() !";
	}

	, ALF : 1.0e-4
	, TOLY : 1.0e-7

//Caller provides	this.linearSearch( n, _Coefficients, fp, g, xi, pnew, out _Minimum, stpmax, out check, _FunctionEval, _Params );
//Callee requires	, linearSearch : function( var n, var[] xold, var fold, var[] g, var[] p, var[] x, out var f, var stpmax, out var check, BFGSFunctionEval _FunctionEval, object _Params )
	, linearSearch : function( _Params )
	{
		var	n = _Params.n;
		var	xold = _Params.coeffs;
		var	fold = _Params.functionMinimum;
		var	g = _Params.g;
		var	p = _Params.xi;
		var	x = _Params.pnew;
		var	stpmax = _Params.stpmax;
		var	_FunctionEval = _Params.eval;

		var i;
		var a,alam,alam2 = 0.0,alamin,b,disc,f2 = 0.0,fold2 = 0.0,rhs1,rhs2,slope,sum,temp,test,tmplam;

		_Params.check = 0;
		for ( sum=0.0,i=1; i <= n; i++ )
			sum += p[i]*p[i];
		sum = Math.sqrt( sum );

		if ( sum > stpmax )
			for ( i=1; i <= n; i++ )
				p[i] *= stpmax / sum;

		for ( slope=0.0,i=1; i <= n; i++ )
			slope += g[i] * p[i];

		test = 0.0;
		for ( i=1; i <= n; i++ )
		{
			temp = Math.abs( p[i] ) / Math.max( Math.abs( xold[i] ), 1.0 );
			if ( temp > test )
				test = temp;
		}

		alamin = this.TOLY / test;
		alam = 1.0;
		for (;;)
		{
			for ( i=1; i <= n; i++ )
				x[i] = xold[i] + alam * p[i];

			// Evaluate minimum with our coefficients
			var	OldCoeffs = _Params.coeffs;
			_Params.coeffs = x;
			_Params.linearSearchMinimum = _FunctionEval( _Params );
			if ( isNaN( _Params.linearSearchMinimum ) )
				throw "Check your eval function => it returned NaN!";
			_Params.coeffs = OldCoeffs;

			if ( alam < alamin )
			{
				for ( i=1; i <= n; i++ )
					x[i] = xold[i];

				_Params.check = 1;
				return;
			}
			else if ( _Params.linearSearchMinimum <= fold + this.ALF * alam * slope )
				return;
			else
			{
				if ( alam == 1.0 )
					tmplam = -slope / (2.0 * (_Params.linearSearchMinimum - fold-slope));
				else
				{
					rhs1 = _Params.linearSearchMinimum-fold-alam*slope;
					rhs2 = f2-fold2-alam2*slope;
					a=(rhs1/(alam*alam)-rhs2/(alam2*alam2))/(alam-alam2);
					b=(-alam2*rhs1/(alam*alam)+alam*rhs2/(alam2*alam2))/(alam-alam2);
					if (a == 0.0) tmplam = -slope/(2.0*b);
					else
					{
						disc = b*b - 3.0 * a * slope;
						if ( disc < 0.0 )
							throw "Roundoff problem in linearSearch() !";
						else
							tmplam = (-b + Math.sqrt( disc ) ) / (3.0 * a);
					}
					if ( tmplam > 0.5 * alam )
						tmplam = 0.5 * alam;
				}
			}
			alam2 = alam;
			f2 = _Params.linearSearchMinimum;
			fold2 = fold;
			alam = Math.max( tmplam, 0.1*alam );
		}
	}
}
*/