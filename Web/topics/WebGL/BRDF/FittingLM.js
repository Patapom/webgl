/*
 Helper fitting class implementing Levenberg-Marquardt optimization
 http://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm

 Implementation stolen from http://www.ssl.berkeley.edu/~mlampton/LMdemo.java

 Interesting talk: http://stackoverflow.com/questions/4437318/limitations-of-the-levenberg-marquardt-algorithm
 */
o3djs.provide( 'BRDF.FittingLM' );
o3djs.require( 'patapi.math' );

FittingLM = function()
{
}

FittingLM.prototype =
{
	Dispose : function()
	{
	}

	//////////////////////////////////////////////////////////////////////////
	// Global params
	, NPARAMS : 8		// Pom specular model uses 8 parameters
	, NPTS : 90*90		// Amount of points in the model. BRDFs are stored as 90x90 luminance values

 	, _parameters : []	// Our parameters that we need to fit against the model

	, _data : []		// Where we will store our BRDF data

	, _residuals : []	// The array of residual errors for every parameters
	, _jacobian : []	// The jacobian matrix

	// Cached callbacks
	, _constraintCallback : null
	, _prepareEvalModelCallback : null
	, _evalModelCallback : null

	, PerformFitting : function( _BRDFTarget, _BRDFPom, _InitialParameters, _ConstraintCallback, _PrepareEvalModelCallback, _EvalModelCallback, _UpdateParametersCallback )
	{
		this.NPARAMS = _InitialParameters.length;
		this._parameters = _InitialParameters;
		this._constraintCallback = _ConstraintCallback;
		this._prepareEvalModelCallback = _PrepareEvalModelCallback;
		this._evalModelCallback = _EvalModelCallback;

		this._residuals = this.InitVector( this.NPTS );
		this._jacobian = this.InitMatrix( this.NPTS, this.NPARAMS );
		this._data = this.InitMatrix( 90, 90 );

//*		// Prepare the array of luminance values from the BRDF
		var	Luminance = new vec3( 0.2126, 0.7152, 0.0722 );		// Observer. = 2°, Illuminant = D65
		for ( var Y=0; Y < 90; Y++ )
			for ( var X=0; X < 90; X++ )
			{
				var	Reflectance = _BRDFTarget.sample( X, Y );
				var	Luma = Reflectance.dot( Luminance );
				this._data[Y][X] = Luma;
			}
//*/

/*		Data are a 2D gaussian jittered with noise
		var	TargetParams = [
			26.2,		// X/Y position of the gaussian center
			24.7,
			50000.0,	// Amplitude
			2.0,		// Variance
			1000.0		// Offset
		];
		for ( var Y=0; Y < 90; Y++ )
			for ( var X=0; X < 90; X++ )
			{
				var Dx = X - TargetParams[0]; 
				var Dy = Y - TargetParams[1]; 
				var r = Math.sqrt(Dx*Dx+Dy*Dy);
				var	Gauss = TargetParams[4] + TargetParams[2] * this.gauss2D( r, TargetParams[3] );

				// Add noise
				var	RandSum = -6.0;
				for ( var i=0; i<12; i++ )
					RandSum += Math.random(); 
				var	Random = RandSum * Math.sqrt( Gauss );
 
				this._data[Y][X] = Gauss + Random;
			}

		// Prepare parameters
		this._parameters = [
			0, 0,
			100000,
			1,
			100,
			-1,
			-1,
			-1,
		];
        var	biggest = 0.0; 
		for ( var Y=0; Y < 90; Y++ )
			for ( var X=0; X < 90; X++ )
				if ( this._data[Y][X] > biggest )
				{
					biggest = this._data[Y][X];
					this._parameters[0] = X;
					this._parameters[1] = Y;
				}
//*/

		// Launch the computation
		try
		{
			this.LM( _UpdateParametersCallback );
		}
		catch ( _e )
		{
			window.alert( "Mais crotte !\n\n" + _e );
		}

		// Assign new parameters even if it failed (perhaps it will be better with those as a starting point?)
		_UpdateParametersCallback( this._parameters );
	}


	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	// Uses current parameters[] vector; 
	// Evaluates resid[i] = (model[i] - data[i])*rootWeight[i]. 
	// Returns sum-of-squares. 
	, ComputeResiduals : function()
	{
		var	C, B, Diff;
		var	SumSqDifference = 0.0;

//*	
		// Prepare model for evaluation
		this._prepareEvalModelCallback( this._parameters );

		// We must return the sum of square differences between current function and target BRDF
		for ( Y=0; Y < 90; Y++ )
			for ( X=0; X < 90; X++ )
			{
				C = this._evalModelCallback( this._parameters, X, Y );

// Use log
C = Math.log( Math.max( 1e-6, C ) );


				// Actual BRDF
				B = this._data[Y][X];

// Use log
B = Math.log( Math.max( 1e-6, B ) );


				Diff = C - B;

				// Setup residual
				this._residuals[90*Y+X] = Diff;

				// Accumulate sum of square differences
				Diff *= Diff;
				SumSqDifference += Diff;
			}
//*/

/*		// TEST WITH A SIMPLE PHONG MODEL
		// We must return the difference between current function and target BRDF
		var	N = this._parameters[2];
		var	Fact = (N+2)*(N+4)/(8.0*Math.PI*(Math.pow( 2.0, -0.5*N ) + N));	// From http://www.farbrausch.de/~fg/stuff/phong.pdf

		for ( Y=0; Y < 90; Y++ )
		{
			v = 1.0 - Y / 90.0;
			for ( X=0; X < 90; X++ )
			{
				// Phong
				var	ThetaH = Math.HALFPI * X*X/8100.0;
				C = Fact * Math.pow( Math.cos( ThetaH ), N );

				// Actual BRDF
				B = this._data[Y][X];

				Diff = C - B;

				// Setup residual
				this._residuals[90*Y+X] = Diff;

				// Accumulate sum of square differences
				Diff *= Diff;
				SumSqDifference += Diff;
			}
		}
//*/

/*		TEST WITH 2D GAUSSIAN MODEL
		for ( var Y=0; Y < 90; Y++ )
			for ( var X=0; X < 90; X++ )
			{
				var Dx = X - this._parameters[0]; 
				var Dy = Y - this._parameters[1]; 
				var r = Math.sqrt(Dx*Dx+Dy*Dy);
				C = this._parameters[4] + this._parameters[2] * this.gauss2D( r, this._parameters[3] );

				// Actual data
				B = this._data[Y][X];
 
				Diff = C - B;

				// Setup residual
				this._residuals[90*Y+X] = Diff;

				// Accumulate sum of square differences
				Diff *= Diff;
				SumSqDifference += Diff;
			}
//*/

		if ( isNaN( SumSqDifference ) )
			throw "NaN in ComputeResiduals()!";

		return SumSqDifference;
	}

	// Allows LM to modify parameters[] and reevaluate.
	// Returns sum-of-squares for nudged params.
	// This is the only place that parameters[] are modified.
	, NudgeParameters : function( _Delta )
	{
		for (var j=0; j < this.NPARAMS; j++ )
			this._parameters[j] += _Delta[j]; 

		// Apply constraints
		this._constraintCallback( this._parameters );

		return this.ComputeResiduals(); 
	}

	// Allows LM to compute a new Jacobian.
	// Uses current parameters[] and two-sided finite difference.
	// If current parameters[] is bad, returns false.  
	, DELTAP : 1e-6 // Parameter step
	, BuildJacobian : function()
	{
		var	FACTOR = 0.5 / this.DELTAP;
		var	delta = this.InitVector( this.NPARAMS );

		for ( var j=0; j < this.NPARAMS; j++ )
		{
			for ( var k=0; k < this.NPARAMS; k++ )
				delta[k] = (k==j) ? this.DELTAP : 0.0;

			this.NudgeParameters( delta );	// resid at pplus
			for ( var i=0; i < this.NPTS; i++ )
				this._jacobian[i][j] = this._residuals[i];

			for ( var k=0; k < this.NPARAMS; k++ )
				delta[k] = (k==j) ? -2*this.DELTAP : 0.0;

			this.NudgeParameters( delta );	// resid at pminus
			for ( var i=0; i < this.NPTS; i++ )
				this._jacobian[i][j] -= this._residuals[i];  // fetches resid[]

			for ( var i=0; i < this.NPTS; i++ )
				this._jacobian[i][j] *= FACTOR;

			for ( var k=0; k < this.NPARAMS; k++ )
				delta[k] = (k==j) ? this.DELTAP : 0.0;

			this.NudgeParameters( delta );
		}
	}

	// Returns Gaussian 2D density normalized to unit total mass. 
	// Only used for testing...
	, gauss2D : function( r, sigma )
	{
		if ( sigma <= 0.0 )
			return	0.0;

		var	arg = 0.5*r*r / (sigma*sigma); 
		if ( arg > 15 )
			return 0.0;

		return Math.exp(-arg) / (2*Math.PI*sigma*sigma); 
	}


	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	// LM Implementation
	// class LM   Levenberg Marquardt w/ Lampton improvements
	// M.Lampton, 1997 Computers In Physics v.11 #10 110-115.
	//
	// Constructor is used to set up all parameters including host for callback.
	// LMIteration() performs one iteration.
	// Host arrays parameters[], resid[], jac[][] are unknown here.
	// Callback method uses CallerID to access four host methods:
	//
	//   var	NudgeParameters(dp);         Moves parameters, builds resid[], returns SumOfSquares.
	//   boolean BuildJacobian();  Builds Jacobian, returns false if parameters NG.
	//
	// Exit leaves host with optimized parameters[]. 
	//
	// @author: M.Lampton UCB SSL (c) 2005
	//
	, LMITER		:  200		// max number of L-M iterations
	, LAMBDA_BOOST  :  2.0		// damping increase per failed step
	, LMSHRINK		: 0.10		// damping decrease per successful step
	, LAMBDAZERO	: 0.001		// initial damping
	, LAMBDAMAX		:  1E9		// max damping
	, LMTOL			: 1E-12		// exit tolerance
 
	, _iterationsCount : 0
	, _sqSum : 0.0
	, _sqSumPrev : 0.0
	, _lambda : 1.0

	, _delta : []				// local parm change (double[])
	, _beta : []				// local (double[])
	, _alpha : []				// local (double[][])
	, _amatrix : []				// local (double[][])

	// Constructor sets up fields and drives iterations. 
	, LM : function( _Callback )
	{
		this._delta = this.InitVector( this.NPARAMS );
		this._beta = this.InitVector( this.NPARAMS );
		this._alpha = this.InitMatrix( this.NPARAMS, this.NPARAMS );
		this._amatrix = this.InitMatrix( this.NPARAMS, this.NPARAMS );
		this._lambda = this.LAMBDAZERO; 

		this._iterationsCount = 0; 
		while ( ++this._iterationsCount < this.LMITER )
		{
			if ( this.LMIteration() )
				return;

			_Callback( this._parameters );	// Notify of a new step...
		} 
	}

	// Each call performs one LM iteration. 
	// Returns true if done with iterations; false=wants more. 
	// Global nadj, npts; needs nadj, myH to be preset. 
	// Ref: M.Lampton, Computers in Physics v.11 pp.110-115 1997.
	, LMIteration : function()
	{
		for ( var k=0; k < this.NPARAMS; k++ )
			this._delta[k] = 0.0;

		this._sqSum = this.NudgeParameters( this._delta );
		this._sqSumPrev = this._sqSum;

		try
		{
			this.BuildJacobian()
		}
		catch ( _e )
		{
			throw "LMIteration() error in BuildJacobian():\n" + _e;
		}

		for ( var k=0; k < this.NPARAMS; k++ )		// get downhill gradient beta
		{
			this._beta[k] = 0.0;
			for ( var i=0; i < this.NPTS; i++ )
				this._beta[k] -= this._residuals[i] * this._jacobian[i][k];
		}

		for ( var k=0; k < this.NPARAMS; k++ )      // get curvature matrix alpha
			for ( var j=0; j < this.NPARAMS; j++ )
			{
				this._alpha[j][k] = 0.0;
				for ( var i=0; i < this.NPTS; i++ )
					this._alpha[j][k] += this._jacobian[i][j] * this._jacobian[i][k];
			}

		var	rrise = 0; 
		do	// damping loop searches for one downhill step
		{
			for ( var k=0; k < this.NPARAMS; k++ )	// copy and damp it
				for ( var j=0; j < this.NPARAMS; j++ )
					this._amatrix[j][k] = this._alpha[j][k] + ((j==k) ? this._lambda : 0.0);

			this.SolveGaussJordan( this._amatrix, this.NPARAMS );	// invert

			for ( var k=0; k < this.NPARAMS; k++ )	// compute delta[]
			{
				this._delta[k] = 0.0; 
				for ( var j=0; j < this.NPARAMS; j++ )
					this._delta[k] += this._amatrix[j][k] * this._beta[j];
			}

			this._sqSum = this.NudgeParameters( this._delta );	// try it out.

			rrise = (this._sqSum-this._sqSumPrev) / (1+this._sqSum);
			if ( rrise <= 0.0 )						// good step!
			{
				this._lambda *= this.LMSHRINK;		// shrink lambda
				break;								// leave lmInner.
			}

			for ( var q=0; q < this.NPARAMS; q++ )	// reverse course!
				this._delta[q] *= -1.0;

			this.NudgeParameters( this._delta );	// sosprev should still be OK
			if ( rrise < this.LMTOL )				// finished but keep prev parameters
				break;								// leave inner loop

			this._lambda *= this.LAMBDA_BOOST;		// else try more damping.

		} while ( this._lambda < this.LAMBDAMAX );

		var	done = (rrise > -this.LMTOL) || (this._lambda > this.LAMBDAMAX); 
		if ( done )
			return true;	// So we can put a breakpoint...

		return done; 
	}

	// Inverts the array a[N][N] by Gauss-Jordan method
	// M.Lampton UCB SSL (c)2003, 2005
	//	a, matrix to invert (double[][])
	//	N, size of the matrix
	//
	, SolveGaussJordan : function( a, N )
	{
		var	det = 1.0, big, save;
		var i,j,k,L;
		var ik = this.InitVector(100);
		var jk = this.InitVector(100);
		for ( k=0; k<N; k++ )
		{
			big = 0.0;
			for ( i=k; i<N; i++ )
				for ( j=k; j<N; j++ )	// find biggest element
					if ( Math.abs(big) <= Math.abs(a[i][j]) )
					{
						big = a[i][j];
						ik[k] = i;
						jk[k] = j;
					}
			if ( big == 0.0)
				return 0.0;

			i = ik[k];
			if ( i > k )
				for (j=0; j<N; j++)			// exchange rows
				{
					save = a[k][j];
					a[k][j] = a[i][j];
					a[i][j] = -save;
				}

			j = jk[k];
			if ( j > k )
				for (i=0; i<N; i++)
				{
					save = a[i][k];
					a[i][k] = a[i][j];
					a[i][j] = -save;
				}

			for ( i=0; i<N; i++ )			// build the inverse
				if (i != k)
					a[i][k] = -a[i][k]/big;

			for ( i=0; i<N; i++ )
				for ( j=0; j<N; j++ )
					if ((i != k) && (j != k))
						a[i][j] += a[i][k]*a[k][j];

			for (j=0; j<N; j++)
				if (j != k)
					a[k][j] /= big;
			a[k][k] = 1.0 / big;

			det *= big;						// bomb point
		}									// end k loop

		for ( L=0; L<N; L++ )
		{
			k = N-L-1;
			j = ik[k];
			if ( j > k )
				for ( i=0; i<N; i++ )
				{
					save = a[i][k];
					a[i][k] = -a[i][j];
					a[i][j] = save;
				}

			i = jk[k];
			if ( i > k )
				for ( j=0; j<N; j++ )
				{
					save = a[k][j];
					a[k][j] = -a[i][j];
					a[i][j] = save;
				}
		}

		return det;
	}

	// ===========================================
	// Useful private functions
	, InitVector : function( _Length )
	{
		var	m = [];
		for ( var	i=0; i < _Length; i++ )
			m[i] = 0.0;

		return m;
	}

	, InitMatrix : function( _Rows, _Columns )
	{
		var	m = [];
		for ( var	i=0; i < _Rows; i++ )
		{
			m[i] = [];
			for ( var	j=0; j < _Columns; j++ )
				m[i][j] = 0.0;
		}

		return m;
	}
}
