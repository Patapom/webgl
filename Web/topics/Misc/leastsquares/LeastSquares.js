var N = 5;  // Global variable, MAX number of basis functions of polynomial to be fit to data

// Calculate the Euclidean norm of the input vector, x: sqrt(xT*x)
// This subroutine is based on the LINPACK routine SNRM2, written 25 October 1982, modified
// on 14 October 1993 by Sven Hammarling of Nag Ltd.
// I have further modified it for use in this Javascript routine, for use with a column
// of an array rather than a column vector.
//
// N - number of rows in column
// H - Matrix
// p - column index of column whose norm is to be calculated
// rI - row index, row below which (inclusive) norm of column is to be calculated
function euclid2Norm(N, H, p, rI)
{
	var	absxi, dummy, scale = 0.0, ssq = 1.0;

	for ( var i = rI; i < N; i++ )
	{
		if ( H[i][p] == 0 )
			continue;

		absxi = Math.abs(H[i][p]);
		dummy = scale / absxi;
		ssq = 1.0 + ssq*dummy*dummy;
		scale = absxi;
	}

	return scale * Math.sqrt(ssq);
}

function llsqpy4Solve( _couples, _degree )
{
	var numRows = _couples.length; //Indicates the number of rows for which valid data has been entered (all our data are valid so numRows is simply the amount of couples)
	var powIndex = _degree; //Indicates the highest power of x that was checked. Used as a column index

	// Build the input matrix & vector
	var A = new Array(numRows);
	var qty = new Array(numRows);
	for ( var i = 0; i < numRows; i++ )
	{
		A[i] = new Array(N);
		A[i][1] = _couples[i].x;
		qty[i] = _couples[i].y;
	}


	///////////////////////////////////////////////////////////////////////////
	// POM: Same routine as original
	//
	var maxnrm, maxi, dummy, kr = 0, nrmxl, t, tt;
	var k, lp1;							// Array index

	var rsd = new Array(numRows);		// Array of residuals
	var tol = 1.0e-14;					// For now, explicitly assign tol a value of 1.0e-14

	// The following variables are vectors of AT MOST 5 entries (N = the MAX number of basis functions)

	var jpvt = new Array(N);			// Auxiliary array used in the factorization of A
	var w = new Array(N);				// Auxiliary array used in the factorization of A
	var qraux = new Array(N);			// Auxiliary array used in the factorization of A
	var done = new Array(N);			// Temporary Array
	var X = new Array(N);				// Array of results

// POM: Removed
// 	for (var i = 0; i < numRows; i++)
// 		A[i] = new Array(N);
// 
// 	var xIndex = 1; // Form index for x data field
// 	var bIndex = 2; // Form index for b data field
//	var checkIndex = 0;					// Form index for checkboxes
// 	for (var i = 0; i < numRows; i++) {//Examine the 20 data fields
// 		if (dataFormElements[checkIndex].checked)
// 		{
// 			tempx = parseFloat(dataFormElements[xIndex].value);
// 			tempb = parseFloat(dataFormElements[bIndex].value);
// 			if ( !isNaN(tempx) && !isNaN(tempb) )
// 			{ //Both fields contain valid numbers; otherwise ignore
// 				A[numRows][1] = tempx;
// 				qty[numRows] = tempb;
// 				numRows++;
// 			}//End if !isNaN
// 			else
// 				alert("Invalid input for data pair " + (Math.floor(xIndex/3) + 1) + ".");
// 		} // End if checkbox checked
// 		checkIndex += 3;
// 		xIndex += 3;
// 		bIndex += 3;
// 	}// End for i loop


	// Fill coefficient array
	for (var i = 0; i < numRows; i++)
	{
		A[i][0] = 1.0;
		var	tempb = A[i][1];
		for (var j = 2; j <= powIndex; j++)
		{
			tempb *= A[i][1];
			A[i][j] = tempb;
		}//End for j loop
	}//End for i loop

	// At this point, A should contain the data matrix and qty should contain the b values.
	// numRows should indicate the number of valid rows in A and b
	// powIndex should be the degree selected for the polynomial to be fit to the data

	for (var j = 0; j <= powIndex; j++){
		jpvt[j] = j;
		w[j] = qraux[j] = euclid2Norm(numRows, A, j, 0); // Compute norms of free columns
	}//End for j loop

	//****SQRANK

	// Perform Householder reduction of A
	for (var i = 0; i <= powIndex; i++){

	if (i < powIndex){  // Locate the column of the largest Norm and bring it into the pivot position.
	maxnrm = 0.0;
	maxi = i;
	for (var j = i; j <= powIndex; j++){
	if (qraux[j] > maxnrm){
		maxnrm = qraux[j];
		maxi = j;
	} //End (qraux[j] > maxnrm)
	}//End for j

	if (maxi != i){
	for (var j = 0; j < numRows; j++){
		dummy = A[j][i];
		A[j][i] = A[j][maxi];
		A[j][maxi] = dummy;
	}//End for j

	qraux[maxi] = qraux[i];
	w[maxi] = w[i];
	dummy = jpvt[maxi];
	jpvt[maxi] = jpvt[i];
	jpvt[i] = dummy;

	}//End if (maxi != i)
	}//End if (i < powIndex)

	qraux[i] = 0.0;

	if (i != (numRows - 1)){  //Compute the Householder transformation for column i
	nrmxl = euclid2Norm(numRows, A, i, i);
	if (nrmxl != 0){
	if (A[i][i] != 0)
		nrmxl = ((A[i][i] < 0) ? -Math.abs(nrmxl) : Math.abs(nrmxl));

	for (var j = i; j < numRows; j++)
		A[j][i] *= 1.0/nrmxl;

	A[i][i] += 1.0;

	lp1 = i + 1;

	//Apply the transformation to the remaining columns, updating the norms

	if (powIndex >= lp1){
		for (var j = lp1; j <= powIndex; j++){
		dummy = 0.0;
		for (k = i; k < numRows; k++)
		dummy += A[k][i]*A[k][j];
		t = -(dummy/A[i][i]);
		for (k = i; k < numRows; k++)
		A[k][j] += t*A[k][i];

		if (qraux[j] != 0.0){
		dummy = Math.abs(A[i][j])/qraux[j];
		tt = 1.0 - dummy*dummy;
		t = tt = ((tt > 0) ? tt : 0.0);
		dummy = qraux[j]/w[j];
		tt = 1.0 + 0.05*tt*dummy*dummy;
		if (tt != 1.0)
		qraux[j] *= Math.sqrt(t);
		else
		w[j] = qraux[j] = euclid2Norm(numRows, A, j, i+1)

		}//End if (qraux[j] != 0)

		}//End for (var j = lp1; j <= powIndex; j++)

	}//End if (powIndex >= lp1)

	qraux[i] = A[i][i];  //Save the transformation
	A[i][i] = -nrmxl;

	}//End if (nrmxl != 0)

	} //End if (i != (numRows - 1))

	}//End for i loop

	// Calculate the rank of the (original) coefficient matrix

	dummy = tol*Math.abs(A[0][0]);
	for (var i = 0; i <= powIndex; i++){
	if (Math.abs(A[i][i]) <= dummy)
	break;
	else
	kr++;
	}//End for i

// POM: Removed
//	dataForm.kr.value = kr;

	//****END OF SQRANK

	//****SQRLSS

	if (kr != 0){

	lp1 = ((kr < (numRows-1)) ? kr : (numRows-1));

	for (var i = 0; i < lp1; i++){  // Compute Trans(Q)*Y
	if (qraux[i] != 0){
	tt = A[i][i];
	A[i][i] = qraux[i];
	dummy = 0.0;
	for (var j = i; j < numRows; j++)
		dummy += A[j][i]*qty[j];
	t = -(dummy/A[i][i]);
	for (var j = i; j < numRows; j++)
		qty[j] += t*A[j][i];
	A[i][i] = tt;
	}//End if (qraux[i] != 0)

	}//End for (var i = 0; i < lp1; i++)

	for (var i = 0; i < kr; i++){
	X[i] = qty[i];
	rsd[i] = 0.0;
	} // End for i

	if (kr < numRows){
	for (var i = kr; i < numRows; i++)
	rsd[i] = qty[i];
	}// End if (kr < numRows)

	// COMPUTE B

	for (var i = 0; i < kr; i++){
	k = kr - 1 - i;
	if (A[k][k] == 0.0)
	break;
	X[k] /= A[k][k];
	if (k != 0) {
	t = -X[k];
	for (var j = 0; j < k; j++)
		X[j] += t*A[j][k];
	}//End if (k != 0)
	} // End for (var i = 0; i < kr; i++)

	for (var i = 0; i < lp1; i++){
	k = lp1 - 1 - i;
	if (qraux[k] != 0.0){
	tt = A[k][k];
	A[k][k] = qraux[k];
	dummy = 0.0;
	for (var j = k; j < numRows; j++)
		dummy += A[j][k]*rsd[j];
	t = -(dummy/A[k][k]);
	for (var j = k; j < numRows; j++)
		rsd[j] += t*A[j][k];
	A[k][k] = tt;

	}// End if (qraux[k] != 0.0)

	} // End for (var i = 0; i < lp1; i++)

	}//End if (kr != 0)

	kr--; //Adjust kr for the for loop below, so do not have to evaluate (kr - 1) each loop

	for (var j = 0; j <= powIndex; j++){
	done[j] = 0;
	if (j > kr)
	X[j] = 0.0;
	}//End for (var j = 0; j <= powIndex; j++)

	for (var i = 0; i <= powIndex; i++){
	if (done[i] == 0){
	k = jpvt[i];
	done[i] = 1;
	while (k != i){
	t = X[i];
	X[i] = X[k];
	X[k] = t;
	done[k] = 1;
	k = jpvt[k];
	} //End while (k != i)

	}//End if (done[i] == 0)

	}//End for (var i = 0; i <= powIndex; i++)
	//****END OF SQRLSS

	//
	// POM: Same routine as original
	///////////////////////////////////////////////////////////////////////////

	// Output the results

// POM: Removed
// 	checkIndex = 69; // The form index for the "e" result
// 
// 	for (var i = 0; i < 5; i++){
// 		dataFormElements[checkIndex].value = ((i <= powIndex) ? X[i] : 0);
// 		checkIndex--;
// 	}// End for i
// 
// 	checkIndex = 72; // The form index for rsd1
// 
// 	for (var i = 0; i < numRows; i++)
// 	dataFormElements[checkIndex + i].value = ((i < numRows) ? rsd[i] : 0);

	var	coeffs = [];
	for ( var i=0; i <= powIndex; i++ )
		coeffs.push( X[i] );

	var	residuals = [];
	for ( var i=0; i < numRows; i++ )
		residuals.push( rsd[i] );

	return {
		"coeffs" : coeffs,
		"residuals" : residuals,
	};
}


function newWindow(p)
{	// Function to open a new window for worked example
	var	win = "width=600,height=300,menubar=yes,toolbar=yes,status=yes,scrollbars=yes,resizable=yes";
	window.open(p, "", win);
} //End of function newWindow

// end of JavaScript-->