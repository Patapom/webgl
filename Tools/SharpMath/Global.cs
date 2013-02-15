using System;
using System.Collections.Generic;

namespace WMath
{
	/// <summary>
	/// Global methods for the math library
	/// </summary>
    public class Global
	{
		#region FIELDS

		protected static Stack<float>	ms_Epsilons = new Stack<float>();

		#endregion

		#region METHODS

		public static void	PushEpsilon( float _Epsilon )
		{
			ms_Epsilons.Push( AngleAxis.EPSILON );	// Push current epsilon

			// Set Epsilon in every classes that need it
			AngleAxis.EPSILON = _Epsilon;
			BoundingBox.EPSILON = _Epsilon;
			Matrix3x3.EPSILON = _Epsilon;
			Matrix4x4.EPSILON = _Epsilon;
			Plane.EPSILON = _Epsilon;
			Point.EPSILON = _Epsilon;
			Point2D.EPSILON = _Epsilon;
			Point4D.EPSILON = _Epsilon;
			Vector.EPSILON = _Epsilon;
			Vector2D.EPSILON = _Epsilon;
			Vector4D.EPSILON = _Epsilon;
			Quat.EPSILON = _Epsilon;
		}

		public static void	PopEpsilon()
		{
			float	OldEpsilon = ms_Epsilons.Pop();

			// Set Epsilon in every classes that need it
			AngleAxis.EPSILON = OldEpsilon;
			BoundingBox.EPSILON = OldEpsilon;
			Matrix3x3.EPSILON = OldEpsilon;
			Matrix4x4.EPSILON = OldEpsilon;
			Plane.EPSILON = OldEpsilon;
			Point.EPSILON = OldEpsilon;
			Point2D.EPSILON = OldEpsilon;
			Point4D.EPSILON = OldEpsilon;
			Vector.EPSILON = OldEpsilon;
			Vector2D.EPSILON = OldEpsilon;
			Vector4D.EPSILON = OldEpsilon;
			Quat.EPSILON = OldEpsilon;
		}

		/// <summary>
		/// Compares 2 float values with a tolerance
		/// </summary>
		/// <param name="_Value0"></param>
		/// <param name="_Value1"></param>
		/// <returns></returns>
		public static bool	Equal( float _Value0, float _Value1 )
		{
			return	Math.Abs( _Value0 - _Value1 ) < AngleAxis.EPSILON;
		}

		#endregion
	}
}
