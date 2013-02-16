/*
 Helper fitting class implementing BFGS optimization
 http://en.wikipedia.org/wiki/BFGS_method

 Implementation stolen from http://code.google.com/p/vladium/source/browse/#svn%2Ftrunk%2Foptlib%2Fsrc%2Fcom%2Fvladium%2Futil%2Foptimize
 */
o3djs.provide( 'BRDF.FittingBFGS' );
o3djs.require( 'patapi.math' );

FittingBFGS = function()
{
}

FittingBFGS.prototype =
{
	Dispose : function()
	{
	}

	, PerformFitting : function( _BRDFTarget, _BRDFPom, _InitialParameters, _ConstraintCallback, _PrepareEvalModelCallback, _EvalModelCallback, _UpdateParametersCallback )
	{
		this._constraintCallback = _ConstraintCallback;

		// Prepare the array of luminance values from the BRDF
		var	Values = this.InitMatrix( 90, 90 );
		var	Luminance = new vec3( 0.2126, 0.7152, 0.0722 );		// Observer. = 2°, Illuminant = D65
		var	X, Y;
		for ( Y=0; Y < 90; Y++ )
			for ( X=0; X < 90; X++ )
			{
				var	Reflectance = _BRDFTarget.sample( X, Y );
				var	Luma = Reflectance.dot( Luminance );
				Values[Y][X] = Luma;
			}

		// Prepare our evaluation functions
		var	Goal = 0.01;
		var	C, B, Diff;

		var	SumSqDifference;
		function	EvalModel( _Params )
		{	// We must return the difference between current function and target BRDF

			// Apply constraints
			_ConstraintCallback( _Params );

			// Prepare model
			_PrepareEvalModelCallback( _Params );

			SumSqDifference = 0.0;
			for ( Y=0; Y < 90; Y++ )
				for ( X=0; X < 90; X++ )
				{
					C = _EvalModelCallback( _Params, X, Y );

// Use log
C = Math.log( Math.max( 1e-8, C ) );

					// Actual BRDF
					B = Values[Y][X];

// Use log
B = Math.log( Math.max( 1e-8, B ) );

					Diff = C - B;
					Diff *= Diff;
					SumSqDifference += Diff;
				}

			if ( isNaN( SumSqDifference ) )
				throw "NaN in eval!";

			return SumSqDifference;
		}

		try
		{

			this.minimize( _InitialParameters, EvalModel, _UpdateParametersCallback );
		}
		catch ( _e )
		{
			window.alert( "Mais crotte !\n\n" + _e );
		}

		// Assign new parameters even if it failed (perhaps it will be better with those as a starting point)
		_UpdateParametersCallback( this._optimum );
	}


	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	, _coeffsCount : 0
	, _optimum : []
	, _maxIterations : 200
	, _tolX : 1.0E-8
	, _tolGradient : 1.0E-8
	, _functionMinimum : 1e38
	, _iterationsCount : 0
	, _evalCallsCount : 0
	, _evalGradientCallsCount : 0

	, minimize : function( _Params, _Eval, _ProgressCallback )
	{
		// ===========================================
		// Useful private function
		function	EvalGradient( _Params, _Gradient )
		{	// We must compute the gradient of the difference between current function and target BRDF and store the result in the vector gradient
			var	EPS = 1e-6;
			var	CentralValue = this._functionMinimum;

			for ( var i=0; i < _Params.length; i++ )
			{
				var	OldCoeff = _Params[i];

				_Params[i] -= EPS;
				var	OffsetValueNeg = _Eval( _Params );

				_Params[i] += 2*EPS;
				var	OffsetValuePos = _Eval( _Params );

				_Params[i] = OldCoeff;

				this._evalCallsCount+=2;	// Two more evals

//				var	Derivative = OffsetValue - CentralValue;
				var	Derivative = 0.5 * (OffsetValuePos - OffsetValueNeg);
					Derivative /= EPS;

				_Gradient[i] = Derivative;
			}
		}

		// ===========================================
		// Let's start!
		this._coeffsCount = _Params.length;
		this._optimum = this.InitVector(this._coeffsCount);
		this.eval = _Eval;

		var	Direction = this.InitVector(this._coeffsCount); // x_k+1 = x_k + alpha_k*direction_k

		var	x = this._optimum; // use caller's out buffer to represent the current point
		var	x_prev = _Params;

		var	Gradient = this.InitVector(this._coeffsCount);
		var	PreviousGradient = this.InitVector(this._coeffsCount);

		var	Hessian = this.InitMatrix(this._coeffsCount,this._coeffsCount); // inverse Hessian approximation

		var	pi = this.InitVector(this._coeffsCount);  // p_i = x_i+1 - x_i
		var	qi = this.InitVector(this._coeffsCount);  // q_i = Gradient_i+1 - Gradient_i
		var	Dqi = this.InitVector(this._coeffsCount); // Dq_i = |D_i|.q_i:

		this._evalCallsCount = this._evalGradientCallsCount = 0; // count of function and gradient evaluations

		// Perform initial evaluation
		this._functionMinimum = _Eval( x_prev );				// Initial error
		EvalGradient.call( this, x_prev, PreviousGradient );	// Initial gradient
		this._evalCallsCount++;
		this._evalGradientCallsCount++;

		for ( var d = 0; d < this._coeffsCount; ++d )
		{
			// initialize Hessian to a unit matrix:
			Hessian[d][d] = 1.0;

			// set initial direction to opposite of the starting gradient (since Hessian is just a unit matrix):
			Direction[d] = -PreviousGradient[d];
		}
 
		// perform a max of 'maxiterations' of quasi-Newton iteration steps
		var	temp1, temp2;
		
		this._iterationsCount = 0;
		while ( ++this._iterationsCount < this._maxIterations )
		{
			// do the line search in the current direction:
			var	NewMinimum = this.linearSearch( _Eval, this._functionMinimum, PreviousGradient, x_prev, Direction, x );	// this updates _functionMinimum and x
			this._functionMinimum = NewMinimum;

			// Notify of new optimal values
			_ProgressCallback( x );

			// if the current point shift (relative to current position) is below tolerance, we're done:
			var	delta = 0.0;
			for ( var d=0; d < this._coeffsCount; ++d )
			{
				pi[d] = x[d] - x_prev[d];

				var	temp2 = Math.abs(pi[d]) / Math.max( Math.abs(x[d]), 1.0 );
				if ( temp2 > delta )
					delta = temp2;
			}
			if ( delta < this._tolX )
				break;

			// get the current gradient:  // TODO: use 1 extra _functionMinimum eval gradient version?
			EvalGradient.call( this, x, Gradient ); // this updates Gradient
			this._evalGradientCallsCount++; 
   
			// if the current gradient (normalized by the current x and _functionMinimum) is below tolerance, we're done:
			delta = 0.0;
			temp1 = Math.max( this._functionMinimum, 1.0 );
			for ( var d=0; d < this._coeffsCount; ++d )
			{
				temp2 = Math.abs( Gradient[d] ) * Math.max( Math.abs( x[d] ), 1.0 ) / temp1;
				if ( temp2 > delta )
					delta = temp2;
			}
			if ( delta < this._tolGradient )
				break;

			// compute q_i = Gradient_i+1 - Gradient_i:
			for ( var d=0; d < this._coeffsCount; ++d )
				qi[d] = Gradient[d] - PreviousGradient[d];

			// compute Dq_i = |D_i|.q_i:
			for ( var m=0; m < this._coeffsCount; ++m )
			{
				Dqi[m] = 0.0;
				for ( var n=0; n < this._coeffsCount; ++n )
					Dqi[m] += Hessian[m][n] * qi[n];
			}

			// compute p_i.q_i and q_i.Dq_i:
			var	piqi = 0.0;
			var	qiDqi = 0.0;
			var	pi_norm = 0.0, qi_norm = 0.0;

			for ( var d=0; d < this._coeffsCount; ++d )
			{
				temp1 = qi[d];
				temp2 = pi[d];

				piqi += temp2 * temp1;
				qiDqi += temp1 * Dqi[d];

				qi_norm += temp1 * temp1;
				pi_norm += temp2 * temp2;
			}
			// update Hessian using BFGS formula:

			// note that we should not update Hessian when successive pi's are almost
			// linearly dependent; this can be ensured by checking pi.qi = pi|H|pi,
			// which ought to be positive enough if H is positive definite.
			var	ZERO_PRODUCT = 1.0E-8;
			if ( piqi > ZERO_PRODUCT * Math.sqrt(qi_norm * pi_norm) )
			{
				// re-use qi vector to compute v in Bertsekas:
				for ( var d=0; d < this._coeffsCount; ++d )
					qi[d] = pi[d] / piqi - Dqi[d] / qiDqi;

				for ( var m=0; m < this._coeffsCount; ++m )
				{
					for ( var n=m; n < this._coeffsCount; ++n )
					{
						Hessian[m][n] += pi[m] * pi[n] / piqi - Dqi[m] * Dqi[n] / qiDqi + qiDqi * qi[m] * qi[n];
						Hessian[n][m] = Hessian[m][n];
					}
				}
			}

			// set current direction for the next iteration as -|Hessian|.Gradient 
			for ( var m=0; m < this._coeffsCount; ++m )
			{
				Direction[m] = 0.0;
				for ( var n = 0; n < this._coeffsCount; ++n )
					Direction[m] -= Hessian[m][n] * Gradient[n];
			}

			// update current point and current gradient for the next iteration:
			if ( this._iterationsCount < this._maxIterations-1 ) // keep the 'x contains the latest point' invariant for the post-loop copy below
			{
				var	temp = Gradient;
				Gradient = PreviousGradient;
				PreviousGradient = temp;

				temp = x;
				x = x_prev;
				x_prev = temp;
			}
		}

		// copy the point into ctx (note that x_prev<->x swap hasn't been done):
		if ( this._optimum != x )
		{
			for ( var d=0; d < this._coeffsCount; ++d )
				this._optimum[d] = x[d];
		}
	}


	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	, linearSearch : function( _Eval, _FunctionMinimum, _Gradient, x, _Direction, xout )
	{
		var	ZERO = 1.0E-10;
		var	SIGMA = 1.0E-4;
		var	BETA = 0.5;

		// [Armijo rule]
		var	dLimit = x.length;

		// Compute direction normalizer:
		var	Direction = [];
		var	dnorm = 0.0;
		for ( var d=0; d < dLimit; ++d )
		{
			Direction[d] = _Direction[d];
			dnorm += Direction[d]*Direction[d];
		}
		dnorm = Math.sqrt( dnorm );
		if ( dnorm <= ZERO )
			throw "Direction is a zero vector!";

		// normalize direction (to avoid making the initial step too big):
		for ( var d=0; d < dLimit; ++d )
			Direction[d] /= dnorm;

		// compute _Gradient * Direction (normalized):
		var	p = 0.0;
		for ( var d=0; d < dLimit; ++d )
			p += _Gradient[d] * Direction[d];
		if ( p >= 0.0 )
			throw"'Direction' is not a descent direction [p = " + p + "]!";

		var	alpha = 1.0; // initial step size
		for ( var i=0; ; ++i )
		{
			// take the step:
			for ( var d=0; d < dLimit; ++d )
				xout[d] = x[d] + alpha * Direction[d];

			var	fx_alpha = _Eval( xout );
//			System.out.println (i + " _FunctionMinimum = " + fx_alpha);

			if ( fx_alpha < _FunctionMinimum + SIGMA * alpha * p )
				return fx_alpha;

			if ( i == 0 )
			{	// first step: do quadratic approximation along the direction line and set alpha to be the minimizer of that approximation:
				alpha = 0.5 * p / (p + _FunctionMinimum - fx_alpha);
			}
			else
			{
				alpha *= BETA; // reduce the step
			}
		
			if ( alpha < ZERO )
			{	// prevent alpha from becoming too small
				if ( fx_alpha > _FunctionMinimum )
				{
					for ( var d=0; d < dLimit; ++d )
						xout[d] = x[d];

					return _FunctionMinimum;
				}
				else
				{
					return fx_alpha;
				}
			}
		}
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
