using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

using WMath;

namespace JSONSerializer
{
	// The list of supported scene object types
	//
	public enum		SCENE_OBJECT_TYPES
	{
		TRANSFORM,
		MESH,
		MATERIAL,
		TEXTURE,
		TEXTURE_CUBE,
	}

	/// <summary>
	/// Static object holding helper methods
	/// </summary>
	public class	Helpers
	{
		#region NESTED TYPES

		public delegate System.Windows.Forms.DialogResult	ShowMessageBoxEventHandler( string _Message, System.Windows.Forms.MessageBoxButtons _Buttons, System.Windows.Forms.MessageBoxIcon _Icon );
		public delegate System.Windows.Forms.DialogResult	ShowSingletonMessageBoxEventHandler( string _Message, System.Windows.Forms.MessageBoxButtons _Buttons, System.Windows.Forms.MessageBoxIcon _Icon, out bool _bShowAgain );

		#endregion

		#region FIELDS

		protected static bool		ms_bPrettyPrint = true;

		protected static Dictionary<string,System.Windows.Forms.DialogResult>	ms_MessageBoxID2DialogResult = new Dictionary<string,System.Windows.Forms.DialogResult>();

		#endregion

		#region PROPERTIES

		/// <summary>
		/// Gets or sets the pretty-print flag for human readability
		/// </summary>
		public static bool		PrettyPrint
		{
			get { return ms_bPrettyPrint; }
			set { ms_bPrettyPrint = value; }
		}

		public static event ShowMessageBoxEventHandler			ShowMessageBox;
		public static event ShowSingletonMessageBoxEventHandler	ShowSingletonMessageBox;

		#endregion

		#region METHODS

		#region User Interaction

// 		/// <summary>
// 		/// Shows the current progress of the conversion
// 		/// </summary>
// 		/// <param name="_Progress"></param>
// 		public static void	ShowProgress( float _Progress )
// 		{
// 			if ( Progress != null )
// 				Progress( _Progress );
// 		}

		/// <summary>
		/// Simple alert box
		/// </summary>
		/// <param name="_Message"></param>
		public static System.Windows.Forms.DialogResult	Alert( string _Message )
		{
			return Alert( _Message, System.Windows.Forms.MessageBoxButtons.OK );
		}

		/// <summary>
		/// Simple alert box
		/// </summary>
		/// <param name="_Message"></param>
		public static System.Windows.Forms.DialogResult	Alert( string _Message, System.Windows.Forms.MessageBoxButtons _Buttons )
		{
			return Alert( _Message, _Buttons, System.Windows.Forms.MessageBoxIcon.Information );
		}

		/// <summary>
		/// Simple alert box
		/// </summary>
		/// <param name="_Message"></param>
		public static System.Windows.Forms.DialogResult	Alert( string _Message, System.Windows.Forms.MessageBoxButtons _Buttons, System.Windows.Forms.MessageBoxIcon _Icon )
		{
			return ShowMessageBox != null ? ShowMessageBox( _Message, _Buttons, _Icon ) : System.Windows.Forms.DialogResult.OK;
		}


		/// <summary>
		/// Singleton alert box (shows only once if the user checks a check box)
		/// </summary>
		/// <param name="_MessageBoxID">The unique ID for the message box</param>
		/// <param name="_Message"></param>
		public static System.Windows.Forms.DialogResult	AlertSingle( string _MessageBoxID, string _Message )
		{
			return	AlertSingle( _MessageBoxID, _Message, System.Windows.Forms.MessageBoxButtons.OK );
		}

		/// <summary>
		/// Singleton alert box (shows only once if the user checks a check box)
		/// </summary>
		/// <param name="_MessageBoxID">The unique ID for the message box</param>
		/// <param name="_Message"></param>
		/// <param name="_Buttons"></param>
		public static System.Windows.Forms.DialogResult	AlertSingle( string _MessageBoxID, string _Message, System.Windows.Forms.MessageBoxButtons _Buttons )
		{
			return	AlertSingle( _MessageBoxID, _Message, _Buttons, System.Windows.Forms.MessageBoxIcon.Information );
		}

		/// <summary>
		/// Singleton alert box (shows only once if the user checks a check box)
		/// </summary>
		/// <param name="_MessageBoxID">The unique ID for the message box</param>
		/// <param name="_Message"></param>
		/// <param name="_Buttons"></param>
		/// <param name="_Icon"></param>
		public static System.Windows.Forms.DialogResult	AlertSingle( string _MessageBoxID, string _Message, System.Windows.Forms.MessageBoxButtons _Buttons, System.Windows.Forms.MessageBoxIcon _Icon )
		{
			if ( ms_MessageBoxID2DialogResult.ContainsKey( _MessageBoxID ) )
				return	ms_MessageBoxID2DialogResult[_MessageBoxID];	// Don't show the message box, re-use previous answer

			if ( ShowSingletonMessageBox == null )
				return System.Windows.Forms.DialogResult.OK;

			bool	bShowAgain = true;
			System.Windows.Forms.DialogResult	Result = ShowSingletonMessageBox( _Message, _Buttons, _Icon, out bShowAgain );
			if ( !bShowAgain )
				ms_MessageBoxID2DialogResult[_MessageBoxID] = Result;	// Store result so the message box doesn't show any more

			return	Result;
		}

		/// <summary>
		/// Clears the status of all singleton message boxes
		/// </summary>
		public static void				ClearSingletonMessageBoxStates()
		{
			ms_MessageBoxID2DialogResult.Clear();
		}

		#endregion

		#region Parameter Formatting

		/// <summary>
		/// Formats the given object so it becomes a valid JSON parameter string for a "Param" object (cf. http://code.google.com/apis/o3d/docs/reference/classo3d_1_1_param.html )
		/// </summary>
		/// <param name="_Value">The object to format</param>
		/// <returns></returns>
		/// <remarks>"Param" objects are only used by objects that parametrize shaders, like materials, shapes or primitives !
		/// Don't mistake "Param" objects with standard parameters:
		/// 
		/// _ Param Objects are of the form :		{ "class":"o3d.ParamFloat4", "value" : [0,0,0,1] }
		/// _ Standard parameters are of the form :	{ "value" : [0,0,0] }
		/// 
		/// </remarks>
		public static string	FormatParamObject( object _Value )
		{
			string	ClassName = null;
			if ( _Value is int )
				ClassName = "o3d.ParamInteger";
			else if ( _Value is bool )
				ClassName = "o3d.ParamBoolean";
			else if ( _Value is string )
				ClassName = "o3d.ParamString";
			else if ( _Value is float || _Value is double )
				ClassName = "o3d.ParamFloat";
			else if ( _Value is Vector2D || _Value is Point2D )
				ClassName = "o3d.ParamFloat2";
			else if ( _Value is Vector || _Value is Point )
				ClassName = "o3d.ParamFloat3";
			else if ( _Value is Vector4D || _Value is Point4D )
				ClassName = "o3d.ParamFloat4";
			else if ( _Value is Serializer.O3DScene.O3DObject )
				ClassName = Serializer.O3DScene.O3D_PARAM_TYPE_NAMES[(int) (_Value as Serializer.O3DScene.O3DObject).ObjectType];

			string	Value = WriteObject( _Value );

			if ( ms_bPrettyPrint )
				return	"{ \"class\" : \"" + ClassName + "\", \"value\" : " + Value + " }";

			return	"{\"class\":\"" + ClassName + "\",\"value\":" + Value + "}";
		}

		/// <summary>
		/// Formats the given object so it becomes a valid JSON parameter string
		/// </summary>
		/// <param name="_Value">The object to format</param>
		/// <returns></returns>
		/// <remarks>
		/// Don't mistake Standard Parameters with "Param" objects :
		/// 
		/// _ Standard parameters are of the form :	{ "value" : [0,0,0] }
		/// _ Param Objects are of the form :		{ "class":"o3d.ParamFloat4", "value" : [0,0,0,1] }
		/// 
		/// </remarks>
		public static string	FormatStandardParameter( object _Value )
		{
			if ( ms_bPrettyPrint )
				return	"{ \"value\" : " + WriteObject( _Value ) + " }";

			return	"{\"value\":" + WriteObject( _Value ) + "}";
		}

		#endregion

		#region General Formatting

		/// <summary>
		/// Writes the provided object as a string (will try and write the best string representation given the object type)
		/// </summary>
		/// <param name="_Object"></param>
		/// <returns></returns>
		public static string	WriteObject( object _Object )
		{
			if ( _Object is string )
				return	"\"" + _Object as string + "\"";
			else if ( _Object is bool )
				return	_Object.ToString().ToLower();
			if ( _Object is Point2D )
				return	WritePoint2D( _Object as Point2D );
			else if ( _Object is Vector2D )
				return	WriteVector2D( _Object as Vector2D );
			else if ( _Object is Point )
				return	WritePoint3D( _Object as Point );
			else if ( _Object is Vector )
				return	WriteVector3D( _Object as Vector );
			else if ( _Object is Point4D )
				return	WritePoint4D( _Object as Point4D );
			else if ( _Object is Vector4D )
				return	WriteVector4D( _Object as Vector4D );
			else if ( _Object is Matrix4x4 )
				return	WriteMatrix4x4( _Object as Matrix4x4 );
			else if ( _Object is Serializer.O3DScene.O3DObject )
			{
				if ( ms_bPrettyPrint )
					return	"{ \"ref\" : " + (_Object as Serializer.O3DScene.O3DObject).UniqueID.ToString() + " }";

				return	"{\"ref\":" + (_Object as Serializer.O3DScene.O3DObject).UniqueID.ToString() + "}";
			}

			return	_Object.ToString();
		}

		/// <summary>
		/// Writes the exception (and its inner exceptions) as a string
		/// </summary>
		/// <param name="_e"></param>
		/// <returns></returns>
		public static string	WriteException( object _e )
		{
			if ( _e is Exception )
				return	WriteException( _e as Exception );	// Directly write the exception

			// Check for other recognized types
			Type	T = _e.GetType();
			if ( T.Name == "ErrorObject" )
			{	// Invoke the static "ToException()" method...
				System.Reflection.MethodInfo	MI = T.GetMethod( "ToException" );
				if ( MI != null )
					return	WriteException( MI.Invoke( null, new object[] { _e } ) as Exception );
			}

			return	"Unknown Error...";
		}

		protected static string	WriteException( Exception _e )
		{
			if ( _e == null )
				return	"";

			return	_e.Message + "\r\n" + WriteException( _e.InnerException );
		}

		/// <summary>
		/// Writes a 2D point as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WritePoint2D( Point2D _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + "]";

			return "[" + _Value.x + "," + _Value.y + "]";
		}

		/// <summary>
		/// Writes a 2D vector as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WriteVector2D( Vector2D _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + "]";

			return "[" + _Value.x + "," + _Value.y + "]";
		}

		/// <summary>
		/// Writes a 3D point as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WritePoint3D( Point _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + ", " + _Value.z + "]";

			return "[" + _Value.x + "," + _Value.y + "," + _Value.z + "]";
		}

		/// <summary>
		/// Writes a 3D vector as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WriteVector3D( Vector _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + ", " + _Value.z + "]";

			return "[" + _Value.x + "," + _Value.y + "," + _Value.z + "]";
		}

		/// <summary>
		/// Writes a 4D point as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WritePoint4D( Point4D _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + ", " + _Value.z + ", " + _Value.w + "]";

			return "[" + _Value.x + "," + _Value.y + "," + _Value.z + "," + _Value.w + "]";
		}

		/// <summary>
		/// Writes a 4D vector as a standard JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WriteVector4D( Vector4D _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + _Value.x + ", " + _Value.y + ", " + _Value.z + ", " + _Value.w + "]";

			return "[" + _Value.x + "," + _Value.y + "," + _Value.z + "," + _Value.w + "]";
		}

		/// <summary>
		/// Writes a 4x4 matrix as a standard double JS array
		/// </summary>
		/// <param name="_Value"></param>
		/// <returns></returns>
		public static string	WriteMatrix4x4( Matrix4x4 _Value )
		{
			if ( ms_bPrettyPrint )
				return "[" + WriteVector4D( _Value.GetRow( 0 ) ) + ", " + WriteVector4D( _Value.GetRow( 1 ) ) + ", " + WriteVector4D( _Value.GetRow( 2 ) ) + ", " + WriteVector4D( _Value.GetRow( 3 ) ) + "]";

			return "[" + WriteVector4D( _Value.GetRow( 0 ) ) + "," + WriteVector4D( _Value.GetRow( 1 ) ) + "," + WriteVector4D( _Value.GetRow( 2 ) ) + "," + WriteVector4D( _Value.GetRow( 3 ) ) + "]";
		}

		#endregion

		#region Cast

		/// <summary>
		/// Casts a 3D vector into a HDR 4D vector representing a color
		/// </summary>
		/// <param name="_Color"></param>
		/// <returns></returns>
		public static Vector4D	CastToColorHDR( Vector _Color )
		{
			return new Vector4D( _Color.x, _Color.y, _Color.z, 1.0f );
		}

		/// <summary>
		/// Casts a 3D vector into a LDR color
		/// </summary>
		/// <param name="_Color"></param>
		/// <returns></returns>
		public static System.Drawing.Color	CastToColorLDR( Vector _Color )
		{
			return CastToColorLDR( CastToColorHDR( _Color ) );
		}

		/// <summary>
		/// Casts a 4D vector representing a HDR color into a LDR color
		/// </summary>
		/// <param name="_Color"></param>
		/// <returns></returns>
		public static System.Drawing.Color	CastToColorLDR( Vector4D _Color )
		{
			return System.Drawing.Color.FromArgb( Math.Min( 255, (int) (_Color.w * 255.0f) ), Math.Min( 255, (int) (_Color.x * 255.0f) ), Math.Min( 255, (int) (_Color.y * 255.0f) ), Math.Min( 255, (int) (_Color.z * 255.0f) ) );
		}

		#endregion

		#endregion
	};

	/// <summary>
	/// Static object holding serialization options
	/// </summary>
	public class	Options
	{
		#region FIELDS

		// Meshes
		protected static bool		m_bGenerateBoundingBoxes = true;
		protected static bool		m_bResetXForm = true;
		protected static bool		m_bConsolidateMeshes = true;
		protected static bool		m_bGenerateTangentSpace = true;
		protected static bool		m_bGenerateTriangleStrips = false;
		protected static bool		m_bStorePivotAsCustomData = false;
		protected static bool		m_bCompactUVs = true;

		// Materials

		// Textures
		protected static bool		m_bEmbedTextures = true;

		// Animations
		protected static bool		m_bExportAnimations = true;

		#endregion

		#region PROPERTIES

		/// <summary>
		/// Tells if the objects bounding boxes should be generated (and culling activated)
		/// </summary>
		public static bool			GenerateBoundingBoxes
		{
			get { return m_bGenerateBoundingBoxes; }
			set { m_bGenerateBoundingBoxes = value; }
		}

		/// <summary>
		/// Tells if the objects should only care about their transforms, ignoring the pivot
		/// </summary>
		public static bool			ResetXForm
		{
			get { return m_bResetXForm; }
			set { m_bResetXForm = value; }
		}

		/// <summary>
		/// Tells if the mesh should be consolidated
		/// </summary>
		public static bool			ConsolidateMeshes
		{
			get { return m_bConsolidateMeshes; }
			set { m_bConsolidateMeshes = value; }
		}

		/// <summary>
		/// Tells if the tangent space should be generated (works only if a UV stream exists on the mesh)
		/// </summary>
		public static bool			GenerateTangentSpace
		{
			get { return m_bGenerateTangentSpace; }
			set { m_bGenerateTangentSpace = value; }
		}

		/// <summary>
		/// Tells if the geometry should be serialized as triangle strips
		/// </summary>
		public static bool			GenerateTriangleStrips
		{
			get { return m_bGenerateTriangleStrips; }
			set { m_bGenerateTriangleStrips = value; }
		}

		/// <summary>
		/// Tells if the UV sets should be compacted
		/// </summary>
		public static bool			CompactUVs
		{
			get { return m_bCompactUVs; }
			set { m_bCompactUVs = value; }
		}

		/// <summary>
		/// Tells if the mesh pivots should be stored as custom data
		/// </summary>
		public static bool			StorePivotAsCustomData
		{
			get { return m_bStorePivotAsCustomData; }
			set { m_bStorePivotAsCustomData = value; }
		}


		/// <summary>
		/// Tells if the textures should be embedded in the scene archive
		/// </summary>
		public static bool			EmbedTextures
		{
			get { return m_bEmbedTextures; }
			set { m_bEmbedTextures = value; }
		}


		/// <summary>
		/// Tells if the animations should be exported
		/// </summary>
		public static bool			ExportAnimations
		{
			get { return m_bExportAnimations; }
			set { m_bExportAnimations = value; }
		}

		#endregion
	};


	public class	Serializer
	{
		#region NESTED TYPES

		// The list of suported texture formats
		//
		public enum		TEXTURE_CONVERSION_TYPES
		{
			NONE,	// No conversion, leave texture as is
			JPG,
			PNG,
			DDS,	// NOT SUPPORTED YET
			DXT1,	// NOT SUPPORTED YET
			DXT2,	// NOT SUPPORTED YET
			DXT3,	// NOT SUPPORTED YET
			DXT5,	// NOT SUPPORTED YET
		}

		// The list of actions to perform if no tangent space data is available
		//
		public enum		NO_TANGENT_SPACE_ACTION
		{
			THROW,
			SKIP,
			VALIDATE
		}

		// Scene objects are temporary objects built from imported FBX objects
		//
		#region Scene Objects

		[System.Diagnostics.DebuggerDisplay( "Name={Name}" )]
		public class	SceneObject
		{
			#region FIELDS

			protected Serializer				m_Owner = null;
			protected string					m_Name = null;

			protected SceneObject				m_Parent = null;

			protected Dictionary<string,string>	m_Properties = new Dictionary<string,string>();
			protected Dictionary<string,string>	m_Params = new Dictionary<string,string>();
			protected Dictionary<string,string>	m_Custom = new Dictionary<string,string>();

			#endregion

			#region PROPERTIES

			/// <summary>
			/// Gets the object's name
			/// </summary>
			public string		Name
			{
				get { return m_Name; }
			}

			/// <summary>
			/// Gets the owner serializer
			/// </summary>
			public Serializer	Owner
			{
				get { return m_Owner; }
			}

			/// <summary>
			/// Gets the object's parent
			/// </summary>
			public SceneObject	Parent
			{
				get { return m_Parent; }
			}

			/// <summary>
			/// Gets the dictionary of properties
			/// This will be serialized as "properties" in the JSON file
			/// </summary>
			public Dictionary<string,string>	Properties
			{
				get { return m_Properties; }
			}

			/// <summary>
			/// Gets the dictionary of params
			/// This will be serialized as "params" in the JSON file
			/// </summary>
			public Dictionary<string,string>	Params
			{
				get { return m_Params; }
			}

			/// <summary>
			/// Gets the dictionary of custom data
			/// This will be serialized as "custom" in the JSON file
			/// </summary>
			public Dictionary<string,string>	Custom
			{
				get { return m_Custom; }
			}

			#endregion

			#region METHODS

			public SceneObject( Serializer _Owner, string _Name )
			{
				if ( _Name == null )
					throw new Exception( "Invalid name for object ! You cannot provide null as a name for an object !" );

				m_Owner = _Owner;
				m_Name = _Name;
			}

			/// <summary>
			/// Commits the scene object
			/// </summary>
			public virtual void		Commit()
			{
				m_Owner.Commit( this );
			}

			/// <summary>
			/// Discards the scene object
			/// </summary>
			public virtual void		Discard()
			{
				m_Owner.Discard( this );
			}

			/// <summary>
			/// Sets the object's parent
			/// </summary>
			/// <param name="_Parent">The object's parent</param>
			public void		SetParent( SceneObject _Parent )
			{
				m_Parent = _Parent;
			}

			/// <summary>
			/// Sets a property
			/// </summary>
			/// <param name="_Name">The name of the property to set</param>
			/// <param name="_Value">The value of the property (null clears the property)</param>
			public void		SetProperty( string _Name, string _Value )
			{
				if ( _Value == null && m_Properties.ContainsKey( _Name ) )
					m_Properties.Remove( _Name );
				else
					m_Properties[_Name] = _Value;
			}

			/// <summary>
			/// Sets a param
			/// </summary>
			/// <param name="_Name">The name of the param to set</param>
			/// <param name="_Value">The value of the param (null clears the param)</param>
			public void		SetParam( string _Name, string _Value )
			{
				if ( _Value == null && m_Params.ContainsKey( _Name ) )
					m_Params.Remove( _Name );
				else
					m_Params[_Name] = _Value;
			}

			/// <summary>
			/// Sets a custom property
			/// </summary>
			/// <param name="_Name">The name of the property to set</param>
			/// <param name="_Value">The value of the proeprty (null clears the property)</param>
			public void		SetCustomProperty( string _Name, string _Value )
			{
				if ( _Value == null && m_Custom.ContainsKey( _Name ) )
					m_Custom.Remove( _Name );
				else
					m_Custom[_Name] = _Value;
			}

			#endregion
		};

		public class	Transform : SceneObject
		{
			#region FIELDS

			// Pivot setup. The actual transform's matrix is the composition of the pivot with either the static matrix or the dynamic animation source matrix
			protected Matrix4x4			m_Pivot = null;

			// Static transform setup
			protected Matrix4x4			m_Matrix = null;
			protected Point				m_Position = null;
			protected Matrix3x3			m_Rotation = null;
			protected Quat				m_QRotation = null;
			protected Vector			m_Scale = null;

			// Dynamic transform setup
			protected bool							m_bAnimated = false;
			protected Matrix4x4						m_AnimationSourceMatrix = null;
			protected FBXImporter.AnimationTrack[]	m_AnimP = null;
			protected FBXImporter.AnimationTrack[]	m_AnimR = null;
			protected FBXImporter.AnimationTrack[]	m_AnimS = null;

			protected List<Mesh>		m_Meshes = new List<Mesh>();

			#endregion

			#region PROPERTIES

			public Matrix4x4	Pivot
			{
				get { return m_Pivot != null ? m_Pivot : new Matrix4x4().MakeIdentity(); }
				set { m_Pivot = value; }
			}

			/// <summary>
			/// The staic local transform
			/// </summary>
			public Matrix4x4	Matrix
			{
				get
				{
					if ( m_Matrix != null )
						return	Pivot * m_Matrix;	// Simple...

					// Otherwise, recompose matrix
					Matrix4x4	Result = new Matrix4x4();
								Result.MakeIdentity();

					// Setup the rotation part
					if ( m_Rotation != null )
						Result.SetRotation( m_Rotation );
					else if ( (m_QRotation as object) != null )
						Result = (Matrix4x4) m_QRotation;

					// Setup the scale part
					if ( m_Scale != null )
						Result.Scale( m_Scale );

					// Setup the translation part
					if ( m_Position != null )
						Result.SetTrans( m_Position );

					return	Pivot * Result;
				}
			}

			/// <summary>
			/// Tells if the transform is animated
			/// </summary>
			public bool			IsAnimated
			{
				get { return m_bAnimated; }
			}

			public FBXImporter.AnimationTrack[]	AnimationTrackPositions		{ get { return m_AnimP; } }
			public FBXImporter.AnimationTrack[]	AnimationTrackRotations		{ get { return m_AnimR; } }
			public FBXImporter.AnimationTrack[]	AnimationTrackScales		{ get { return m_AnimS; } }
			public Matrix4x4					AnimationSourceMatrix		{ get { return Pivot * m_AnimationSourceMatrix; } }

			/// <summary>
			/// Gets the list of meshes attached to this transform
			/// </summary>
			public Mesh[]		Meshes
			{
				get { return m_Meshes.ToArray(); }
			}

			#endregion

			#region METHODS

			public Transform( Serializer _Owner, string _Name ) : base( _Owner, _Name )
			{
			}

			#region Static Transform Setup

			public void		SetMatrix( Matrix4x4 _Matrix )
			{
				m_Matrix = _Matrix;
			}

			public void		SetPosition( float _x, float _y, float _z )
			{
				m_Position = new Point( _x, _y, _z );
			}

			public void		SetRotationFromMatrix( float[] _Row0, float[] _Row1, float[] _Row2 )
			{
				if ( _Row0 == null )
					throw new Exception( "Invalid row #0 !" );
				if ( _Row1 == null )
					throw new Exception( "Invalid row #1 !" );
				if ( _Row2 == null )
					throw new Exception( "Invalid row #2 !" );
				if ( _Row0.Length != 3 || _Row1.Length != 3 || _Row2.Length != 3 )
					throw new Exception( "Rows must be of length 3!" );

				float[,]	Mat = new float[3,3];
							Mat[0,0] = _Row0[0];	Mat[0,1] = _Row0[1];	Mat[0,2] = _Row0[2];
							Mat[1,0] = _Row1[0];	Mat[1,1] = _Row1[1];	Mat[1,2] = _Row1[2];
							Mat[2,0] = _Row2[0];	Mat[2,1] = _Row2[1];	Mat[2,2] = _Row2[2];

				m_Rotation = new Matrix3x3( Mat );
			}

			public void		SetRotationFromQuat( float _x, float _y, float _z, float _s )
			{
				m_QRotation = new Quat( _s, _x, _y, _z );
			}

			public void		SetScale( float _x, float _y, float _z )
			{
				m_Scale = new Vector( _x, _y, _z );
			}

			#endregion

			#region Dynamic Transform Setup

			public void		SetAnimationTrackPositions( FBXImporter.AnimationTrack[] _Tracks )
			{
				m_AnimP = _Tracks;
				m_bAnimated = true;
			}

			public void		SetAnimationTrackRotations( FBXImporter.AnimationTrack[] _Tracks )
			{
				m_AnimR = _Tracks;
				m_bAnimated = true;
			}

			public void		SetAnimationTrackScales( FBXImporter.AnimationTrack[] _Tracks )
			{
				m_AnimS = _Tracks;
				m_bAnimated = true;
			}

			public void		SetAnimationSourceMatrix( Matrix4x4 _SourceMatrix )
			{
				m_AnimationSourceMatrix = _SourceMatrix;
			}

			#endregion

			/// <summary>
			/// Adds a mesh to this transform
			/// </summary>
			/// <param name="_Mesh">The mesh to add</param>
			/// <remarks>This will transform into referenced shapes in the JSON file</remarks>
			public void		AddMesh( Mesh _Mesh )
			{
				m_Meshes.Add( _Mesh );
			}

			#endregion
		};

		public class	Mesh : SceneObject
		{
			#region NESTED TYPES

			/// <summary>
			/// Defines the type of data associated to a vertex
			/// </summary>
			public enum		VERTEX_INFO_TYPE
			{
				UNKNOWN,
				POSITION,	// Point
				NORMAL,		// Vector
				TANGENT,	// Vector
				BINORMAL,	// Vector
				TEXCOORD1,	// float
				TEXCOORD2,	// Vector2D
				TEXCOORD3,	// Vector
				COLOR,		// Vector4D => to be cast into UInt32
				COLOR_HDR,	// Vector4D
				SMOOTHING,	// int
			}

			[Flags]
			public enum	TANGENT_SPACE_AVAILABILITY
			{
				NOTHING = 0,
				UVs = 1,
				NORMAL = 2,
				TANGENT = 4,
				BINORMAL = 8,
				FULL = NORMAL | TANGENT | BINORMAL,
				TANGENT_SPACE_ONLY = TANGENT | BINORMAL,
			}

			/// <summary>
			/// Internal class used to consolidate meshes
			/// </summary>
			[System.Diagnostics.DebuggerDisplay( "Index={Index} SMG={SmoothingGroups} V0={VertexIndex0} V1={VertexIndex1} V2={VertexIndex2}" )]
			public class		ConsolidatedFace
			{
				public int					Index = -1;

				// Original data
				public int					VertexIndex0 = -1;
				public int					VertexIndex1 = -1;
				public int					VertexIndex2 = -1;

				// Generated data (WARNING ! => valid only after mesh consolidation)
				public ConsolidatedVertex	V0 = null;
				public ConsolidatedVertex	V1 = null;
				public ConsolidatedVertex	V2 = null;

				// Optional, for consolidation
				public int					SmoothingGroups = 1;
				public FBXImporter.Material	Material = null;

				// Optional, for TS generation
				public Vector				Normal = null;
				public Vector				Tangent = null;
				public Vector				BiNormal = null;
			};

			/// <summary>
			/// Internal class used to consolidate meshes
			/// </summary>
			[System.Diagnostics.DebuggerDisplay( "Index={m_Index} Position={m_PositionInfo.m_Value} SMG={m_SmoothingGroups}" )]
			public class		ConsolidatedVertex
			{
				#region NESTED TYPES

				/// <summary>
				/// Stores an information about the vertex
				/// </summary>
				[System.Diagnostics.DebuggerDisplay( "Type={m_Type} Value={m_Value}" )]
				public class	VertexInfo
				{
					public Mesh				m_OwnerMesh = null;						// The mesh that owns the info
					public FBXImporter.LayerElement	m_SourceLayerElement = null;	// The layer element source for that info

					public VERTEX_INFO_TYPE	m_Type = VERTEX_INFO_TYPE.UNKNOWN;		// The type of info
					public int				m_Index = 0;							// The index of this info
					public object			m_Value = null;							// The value of the info

					// Comparison flags...
					public static bool		ms_CompareSmoothingGroups = false;		// Tells if we should differentiate vertices by their smoothing groups
					public static bool		ms_CompareUVs = false;					// Tells if we should differentiate vertices by their UVs
					public static bool		ms_CompareColors = false;				// Tells if we should differentiate vertices by their colors
					public static bool		ms_CompareTangentSpace = false;			// Tells if we should differentiate vertices by their tangent space

					/// <summary>
					/// Compares with another vertex info of the same type
					/// The comparison strategy is to declare the infos as "equal" if they're not of the same type
					///  or don't have the same index.
					/// The only case when these infos are not equal is when they differ by value.
					/// Thus, it allows us to compare all infos of a vertex against all the infos of another vertex
					///  and to know if the vertices are actually equal to each other because they have the exact same values.
					/// </summary>
					/// <param name="_o"></param>
					/// <returns></returns>
					public bool  Compare( VertexInfo _Info )
					{
						if ( _Info.m_Type != m_Type )
							return	true;	// Not a vertex info of the same type...
						if ( _Info.m_Index != m_Index )
							return	true;

						switch ( m_Type )
						{
							case VERTEX_INFO_TYPE.POSITION:
								return (_Info.m_Value as Point) == (m_Value as Point);

							case VERTEX_INFO_TYPE.NORMAL:
							case VERTEX_INFO_TYPE.TANGENT:
							case VERTEX_INFO_TYPE.BINORMAL:
								return	!ms_CompareTangentSpace || (_Info.m_Value as Vector) == (m_Value as Vector);

							case VERTEX_INFO_TYPE.TEXCOORD3:
								return	!ms_CompareUVs || (_Info.m_Value as Vector) == (m_Value as Vector);

							case VERTEX_INFO_TYPE.TEXCOORD2:
								return	!ms_CompareUVs || (_Info.m_Value as Vector2D) == (m_Value as Vector2D);

							case VERTEX_INFO_TYPE.TEXCOORD1:
								return	!ms_CompareUVs || Math.Abs( (float) _Info.m_Value - (float) m_Value ) < 1e-6f;

							case VERTEX_INFO_TYPE.COLOR:
								return	!ms_CompareColors || _Info.m_Value.Equals( m_Value );

							case VERTEX_INFO_TYPE.COLOR_HDR:
								return	!ms_CompareColors || (_Info.m_Value as Vector4D) == (m_Value as Vector4D);
						}

						return	true;
					}
				};

				#endregion

				// The vertex index
				public int				m_Index = -1;

				// The owner face's smoothing groups
				public int				m_SmoothingGroups = 1;

				// The additional infos associated to the vertex
				public List<VertexInfo>	m_Infos = new List<VertexInfo>();

				// Special infos for tangent space generation
				public VertexInfo		m_PositionInfo = null;
				public VertexInfo		m_NormalInfo = null;
				public VertexInfo		m_TangentInfo = null;
				public VertexInfo		m_BinormalInfo = null;

				// Comparison flags...
				public static bool		ms_CompareSmoothingGroups = false;		// Tells if we should differentiate vertices by their smoothing groups

				/// <summary>
				/// Compares with another vertex
				/// </summary>
				/// <param name="_o"></param>
				/// <returns></returns>
				public bool Compare( ConsolidatedVertex _V )
				{
// 					// Compare positions
// 					if ( _V.m_Position != m_Position )
// 						return	false;

					// Compare smoothing groups
					if ( ms_CompareSmoothingGroups && (_V.m_SmoothingGroups & m_SmoothingGroups) == 0 )
						return	false;

					// Compare additional infos against each other
					// (comparing 2 infos of different types will return true, only 2 infos of the same type having different values will return false)
// 					foreach ( VertexInfo Info in m_Infos )
// 						foreach ( VertexInfo Info2 in _V.m_Infos )
// 							if ( !Info.Compare( Info2 ) )
// 								return	false;

					if ( m_Infos.Count != _V.m_Infos.Count )
						throw new Exception( "2 vertices from the same mesh have a different count of infos !" );

					for ( int InfoIndex=0; InfoIndex < m_Infos.Count; InfoIndex++ )
					{
						VertexInfo	V0 = m_Infos[InfoIndex];
						VertexInfo	V1 = _V.m_Infos[InfoIndex];
						if ( V0.m_Type != V1.m_Type )
							throw new Exception( "2 vertices from the same mesh have infos at the same index but with different types !" );

						if ( !V0.Compare( V1 ) )
							return	false;
					}

					return	true;
				}
			};

			public class		Primitive : SceneObject
			{
				#region NESTED TYPES

				[System.Diagnostics.DebuggerDisplay( "Name={SourceLayerElement.Name} Type={StreamType} Index={Index} Length={m_Stream.Length}" )]
				public class		VertexStream
				{
					#region FIELDS

					protected FBXImporter.LayerElement	m_SourceLayerElement = null;// The source layer element that yielded this vertex stream
					protected VERTEX_INFO_TYPE	m_Type = VERTEX_INFO_TYPE.UNKNOWN;	// The vertex stream type
					protected int				m_Index = 0;						// The stream index
					protected object[]			m_Stream = null;					// The stream data

					#endregion

					#region PROPERTIES

					/// <summary>
					/// Gets the source layer element that yielded this vertex stream
					/// </summary>
					public FBXImporter.LayerElement	SourceLayerElement	{ get { return m_SourceLayerElement; } }

					/// <summary>
					/// Gets the type of data encoded by the stream
					/// </summary>
					public VERTEX_INFO_TYPE		StreamType	{ get { return m_Type; } }

					/// <summary>
					/// Gets the index of the stream (useful if you have several UV sets for example)
					/// </summary>
					public int					Index		{ get { return m_Index; } }

					/// <summary>
					/// Gets the array of data stored by the stream
					/// </summary>
					public object[]				Stream		{ get { return m_Stream; } }

					#endregion

					#region METHODS

					public	VertexStream( FBXImporter.LayerElement _Source, VERTEX_INFO_TYPE _Type, int _Index, int _StreamLength )
					{
						m_SourceLayerElement = _Source;
						m_Type = _Type;
						m_Index = _Index;
						m_Stream = new object[_StreamLength];
					}

					#endregion
				};

				#endregion

				#region FIELDS

				protected Mesh						m_OwnerMesh = null;

				protected FBXImporter.Material		m_Material = null;
				protected Material					m_OverrideMaterial = null;
				protected List<ConsolidatedFace>	m_Faces = new List<ConsolidatedFace>();
				protected List<ConsolidatedVertex>	m_Vertices = new List<ConsolidatedVertex>();

				protected VertexStream[]			m_Streams = null;

				#endregion

				#region PROPERTIES

				public FBXImporter.Material	Material
				{
					get { return m_Material; }
				}

				public Material				OverrideMaterial
				{
					get { return m_OverrideMaterial; }
					set { m_OverrideMaterial = value; }
				}

				public int					VerticesCount
				{
					get { return m_Vertices.Count; }
				}

				public int					FacesCount
				{
					get { return m_Faces.Count; }
				}

				public ConsolidatedFace[]	Faces
				{
					get { return m_Faces.ToArray(); }
				}

				public VertexStream[]		VertexStreams
				{
					get
					{
						if ( m_Streams != null )
							return	m_Streams;

						// We build every stream based on the first vertex's infos (assuming all vertices have the same infos in the same order, if not, that's a mistake anyway)
						ConsolidatedVertex V0 = m_Vertices[0];

						// Build the vertex streams
						List<VertexStream>	Streams = new List<VertexStream>();
						foreach ( ConsolidatedVertex.VertexInfo Info in V0.m_Infos )
							Streams.Add( new VertexStream( Info.m_SourceLayerElement, Info.m_Type, Info.m_Index, m_Vertices.Count ) );

						// Fill up the streams
						for ( int VertexIndex=0; VertexIndex < m_Vertices.Count; VertexIndex++ )
						{
							ConsolidatedVertex	V = m_Vertices[VertexIndex];
							for ( int InfoIndex=0; InfoIndex < V.m_Infos.Count; InfoIndex++ )
							{
								ConsolidatedVertex.VertexInfo	Info = V.m_Infos[InfoIndex];
								Streams[InfoIndex].Stream[VertexIndex] = Info.m_Value;
							}
						}

						// Cache the result
						m_Streams = Streams.ToArray();

						return	m_Streams;
					}
				}

				#endregion

				#region METHODS

				public Primitive( Mesh _OwnerMesh, Serializer _Owner, string _Name, FBXImporter.Material _Material ) : base( _Owner, _Name )
				{
					m_OwnerMesh = _OwnerMesh;
					m_Material = _Material;
				}

				public void		AddFace( ConsolidatedFace _Face )
				{
					m_Faces.Add( _Face );
				}

				#region Mesh Consolidation

				/// <summary>
				/// Consolidates the mesh defined by the primitive's array of faces
				/// </summary>
				public void		Consolidate()
				{
					//////////////////////////////////////////////////////////////////////////
					// Build a list of vertices that have the same characteristics, and faces that reference them
					//

						// This is the map that maps a vertex index from the table of POSITION vertices into a list of consolidated vertices
						// Through this list, we can choose which existing consolidated vertex is equivalent to a given vertex.
						// If none can be found, then a new consolidated vertex is created
					Dictionary<int,List<ConsolidatedVertex>>	OriginalVertexIndex2ConsolidatedVertices = new Dictionary<int,List<ConsolidatedVertex>>();

					foreach ( ConsolidatedFace F in m_Faces )
					{
						// -------------------------------------------------------------------------------
						// Build a new temporary consolidated vertex for every face vertex and insert it into the list
						F.V0 = InsertConsolidatedVertex( m_Vertices, OriginalVertexIndex2ConsolidatedVertices, F.VertexIndex0, m_OwnerMesh.BuildConsolidatedVertex( F, 0, F.VertexIndex0 ) );
						F.V1 = InsertConsolidatedVertex( m_Vertices, OriginalVertexIndex2ConsolidatedVertices, F.VertexIndex1, m_OwnerMesh.BuildConsolidatedVertex( F, 1, F.VertexIndex1 ) );
						F.V2 = InsertConsolidatedVertex( m_Vertices, OriginalVertexIndex2ConsolidatedVertices, F.VertexIndex2, m_OwnerMesh.BuildConsolidatedVertex( F, 2, F.VertexIndex2 ) );
					}
				}

				/// <summary>
				/// Inserts the provided consolidated vertex into the list of vertices
				/// If there already exists a matching vertex in the list of consolidated vertices, then this vertex is returned instead
				/// </summary>
				/// <param name="_ConsolidatedVertices">The list where to insert the vertex in case it does not already exist</param>
				/// <param name="_Dictionary">The dictionary yielding the list of consolidated vertices associated to each original position vertex (as the only forever common data of all vertices (consolidated or not) is their position)</param>
				/// <param name="_OriginalVertexIndex">The index of the original position vertex</param>
				/// <param name="_Vertex">The consolidated vertex to insert</param>
				/// <returns>The inserted consolidated vertex</returns>
				protected ConsolidatedVertex	InsertConsolidatedVertex( List<ConsolidatedVertex> _ConsolidatedVertices, Dictionary<int,List<ConsolidatedVertex>> _Dictionary, int _OriginalVertexIndex, ConsolidatedVertex _Vertex )
				{
					// Check there already is a list of vertices
					if ( !_Dictionary.ContainsKey( _OriginalVertexIndex ) )
						_Dictionary[_OriginalVertexIndex] = new List<ConsolidatedVertex>();

					List<ConsolidatedVertex>	ExistingVertices = _Dictionary[_OriginalVertexIndex];

					if ( !m_OwnerMesh.m_bConsolidate )
					{	// Only check if there already is a vertex at this index
						if ( ExistingVertices.Count > 0 )
							return	ExistingVertices[0];	// Return the only vertex there will ever be at this index
					}
					else
					{	// Check all existing vertices for a match
						foreach ( ConsolidatedVertex ExistingVertex in ExistingVertices )
							if ( ExistingVertex.Compare( _Vertex ) )
								return	ExistingVertex;	// There is a match! Use this vertex instead
					}

					// There was no match, so we insert the provided vertex
					_Vertex.m_Index = _ConsolidatedVertices.Count;
					_ConsolidatedVertices.Add( _Vertex );
					ExistingVertices.Add( _Vertex );

					return	_Vertex;
				}

				#endregion

				#endregion
			};

			/// <summary>
			/// Temporary structure in which we store a face and its influence on a given vertex
			/// This structure is meant to be used in an array of values attached to a vertex
			/// </summary>
			[System.Diagnostics.DebuggerDisplay( "Weight={m_Weight} Index={m_Face.Index}" )]
			protected class		SharedFace
			{
				public ConsolidatedFace	m_Face = null;		// The face referencing this vertex
				public float			m_Weight = 0.0f;	// The weight of this face (in our case, the angle of the face at the given vertex)

				public	SharedFace( ConsolidatedFace _Face, Point _V0, Point _V1, Point _V2 )
				{
					m_Face = _Face;

					// Retrieve the angle formed by the 2 vectors and use it as weight for this face's influence
					Vector	D0 = (_V1 - _V0).Normalize();
					Vector	D1 = (_V2 - _V0).Normalize();
					float	fDot = D0 | D1;
					m_Weight = (float) Math.Acos( fDot );
					if ( float.IsNaN( m_Weight ) )
						m_Weight = 0.0f;	// Occurs when D0 & D1 are very very small or really close to each other (usually, degenerate faces so it's okay if we skip them anyway)
				}
			};

			/// <summary>
			/// A small structure that stores the owner mesh of an external layer element
			/// External layer elements are layer elements that belong to another mesh (i.e. a slave mesh).
			/// The other mesh is a slave to our mesh and adds it to our own layer elements so we take it
			///		into account when consolidating this mesh.
			/// Doing this allows slave meshes to keep a common structure (our mesh) (i.e. the instance) + 
			///		adding their own information, which is coherent with the master structure (meaning for
			///		example that a slave mesh can add its own vertex colors to our mesh and use the whole
			///		thing to display an instance of the master mesh + vertex colors)
			/// </summary>
			public class	ExternalLayerElement
			{
				public Mesh								m_OwnerMesh;
				public FBXImporter.LayerElement			m_LayerElement = null;
			};

			/// <summary>
			/// A small structure that stores the owner mesh of a reference layer element
			/// Reference layer elements are layer elements that belong to another mesh (i.e. a master mesh).
			/// The other mesh is our master mesh and we're using a reference to one of its layer elements
			///		in order to factorize the layer element's data.
			/// </summary>
			public class	ReferenceLayerElement
			{
				public Mesh								m_OwnerMesh;
				public FBXImporter.LayerElement			m_LayerElement = null;
			};

			#endregion

			#region FIELDS

			protected Mesh								m_MasterMesh = null;

			protected Point[]							m_Vertices = null;
			protected FBXImporter.NodeMesh.Triangle[]	m_Faces = null;
			protected List<FBXImporter.LayerElement>	m_LayerElements = new List<FBXImporter.LayerElement>();
			protected List<ExternalLayerElement>		m_LayerElementsExternal = new List<ExternalLayerElement>();
			protected List<ReferenceLayerElement>		m_LayerElementsReference = new List<ReferenceLayerElement>();

			// The dummy layer elements for position & tangent space
			protected FBXImporter.LayerElement			m_LayerElementPosition = null;
			protected FBXImporter.LayerElement			m_LayerElementNormal = null;
			protected FBXImporter.LayerElement			m_LayerElementTangent = null;
			protected FBXImporter.LayerElement			m_LayerElementBiNormal = null;

			// The list of meshes slave of this mesh
			protected List<Mesh>						m_SlaveMeshes = new List<Mesh>();
			protected Dictionary<Mesh,bool>				m_SlaveMesh2Registered = new Dictionary<Mesh,bool>();	// The table that indicates if a mesh is already slave of this mesh

			// These are the 2 lists of collapsed layer elements (ours + external ones from other slave mesh instances)
			// These lists are built in the PerformConsolidation() method
			protected FBXImporter.LayerElement[]		m_CollapsedLayerElements = null;
			protected Mesh[]							m_CollapsedLayerElementMeshes = null;

			protected Material							m_OverrideMaterial = null;

			protected BoundingBox						m_BBox = null;
			protected Matrix4x4							m_Pivot = null;
			protected bool								m_bConsolidate = false;
			protected bool								m_bGenerateMissingTangentSpace = false;
			protected bool								m_bGenerateTriangleStrips = false;
			protected bool								m_bCompactUVs = false;
			protected int								m_UVSetsCount = 0;

			// Generated data
			protected List<Primitive>					m_Primitives = new List<Primitive>();

			#endregion

			#region PROPERTIES

			public bool			IsMaster
			{
				get { return m_MasterMesh == null; }
			}

			public Mesh			MasterMesh
			{
				 get { return m_MasterMesh; }
			}

			public Point[]		Vertices
			{
				get { return m_Vertices; }
			}

			public FBXImporter.NodeMesh.Triangle[]	Faces
			{
				get { return m_Faces; }
			}

			public FBXImporter.LayerElement[]		LayerElements
			{
				get
				{
					// The layer elements of a mesh are its own + the referenced ones
					// (NOTE: Not the external ones are they're not part of this mesh)
					List<FBXImporter.LayerElement>	Result = new List<FBXImporter.LayerElement>();
					foreach ( ReferenceLayerElement RLE in m_LayerElementsReference )
						Result.Add( RLE.m_LayerElement );
					Result.AddRange( m_LayerElements );

					return Result.ToArray();
				}
			}

			public Primitive[]	ConsolidatedPrimitives
			{
				get { return m_Primitives.ToArray(); }
			}

			/// <summary>
			/// Gets or sets the mesh's bounding box
			/// </summary>
			public BoundingBox	BoundingBox
			{
				get { return m_BBox; }
				set { m_BBox = value; }
			}

			/// <summary>
			/// Gets or sets the mesh's pivot
			/// </summary>
			/// <remarks>If the pivot is set, the vertices are transformed by this matrix (a.k.a. the "Reset X-Form" operation)</remarks>
			public Matrix4x4	Pivot
			{
				get { return m_Pivot; }
				set { m_Pivot = value; }
			}

			/// <summary>
			/// Marks the mesh for consolidation
			/// </summary>
			public bool		Consolidate
			{
				get { return m_bConsolidate; }
				set { m_bConsolidate = value; }
			}

			/// <summary>
			/// Mark the mesh for tangent space building if it's missing
			/// </summary>
			public bool		GenerateMissingTangentSpace
			{
				get { return m_bGenerateMissingTangentSpace; }
				set { m_bGenerateMissingTangentSpace = value; }
			}

			/// <summary>
			/// Marks the mesh for triangle strips representation (default is triangle list)
			/// </summary>
			public bool		BuildTriangleStrips
			{
				get { return m_bGenerateTriangleStrips; }
				set { m_bGenerateTriangleStrips = value; }
			}

			/// <summary>
			/// Marks the mesh for UV sets compacting
			/// </summary>
			public bool		CompactUVs
			{
				get { return m_bCompactUVs; }
				set { m_bCompactUVs = value; }
			}

			#endregion

			#region METHODS

			public Mesh( Serializer _Owner, string _Name ) : base( _Owner, _Name )
			{
			}

			/// <summary>
			/// Sets the mesh's array of vertices
			/// </summary>
			/// <param name="_Vertices"></param>
			public void	SetVertices( Point[] _Vertices )
			{
				m_Vertices = _Vertices;
			}

			/// <summary>
			/// Sets the mesh's array of faces
			/// </summary>
			/// <param name="_Faces"></param>
			public void	SetFaces( FBXImporter.NodeMesh.Triangle[] _Faces )
			{
				m_Faces = _Faces;
			}

			/// <summary>
			/// Adds a layer element to the mesh, hence adding a new vertex buffer
			/// </summary>
			/// <param name="_LayerElement"></param>
			public void		AddLayerElement( FBXImporter.LayerElement _LayerElement )
			{
				if ( _LayerElement == null )
					throw new Exception( "Invalid layer element !" );

				// Compact identical UV sets
				if ( m_bCompactUVs && _LayerElement.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.UV )
				{
					m_UVSetsCount++;

					// Compare the new layer element with any existing UV element
					if ( m_UVSetsCount > m_Owner.MinUVsCount )
						foreach ( FBXImporter.LayerElement Element in m_LayerElements )
							if ( Element.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.UV )
							{
								object[]	ExistingUV = Element.ToArray();
								object[]	NewUV = _LayerElement.ToArray();	// This array is cached, so the cost is only one

								if ( ExistingUV.Length != NewUV.Length )
									continue;	// They already differ by length...

								// Compare each entry of the arrays
								bool	bEqual = true;
								for ( int i=0; i < ExistingUV.Length; i++ )
								{
									Vector2D	UV0 = ExistingUV[i] as Vector2D;
									Vector2D	UV1 = NewUV[i] as Vector2D;
									if ( UV0 != UV1 )
									{	// They differ !
										bEqual = false;
										break;
									}
								}

								if ( bEqual )
									return;	// Both UV sets are equal, so we don't add the new one...
							}
				}

				// Build the equivalent LayerElement
				m_LayerElements.Add( _LayerElement );
			}

			/// <summary>
			/// Adds a layer element from another (slave) mesh
			/// </summary>
			/// <param name="_OwnerMesh">The mesh owning the layer element to add</param>
			/// <param name="_LayerElement">The external layer element</param>
			public void		AddExternalLayerElement( Mesh _OwnerMesh, FBXImporter.LayerElement _LayerElement )
			{
				ExternalLayerElement	ELE = new ExternalLayerElement();
										ELE.m_OwnerMesh = _OwnerMesh;
										ELE.m_LayerElement = _LayerElement;

				m_LayerElementsExternal.Add( ELE );

				// Add this mesh to our list of slave meshes
				if ( m_SlaveMesh2Registered.ContainsKey( _OwnerMesh ) )
					return;	// Already registered!

				m_SlaveMeshes.Add( _OwnerMesh );
				m_SlaveMesh2Registered[_OwnerMesh] = true;
			}

			/// <summary>
			/// Replaces a layer element from this mesh by a reference to another element from another mesh
			/// </summary>
			/// <param name="_LayerElementSource">The source layer element to replace</param>
			/// <param name="_OwnerMesh">The mesh that owns the referenced layer element</param>
			/// <param name="_LayerElementReference">The layer element to reference in place of our own layer element</param>
			public void		ReplaceLayerElementByAReference( FBXImporter.LayerElement _LayerElementSource, Mesh _OwnerMesh, FBXImporter.LayerElement _LayerElementReference )
			{
				m_LayerElements.Remove( _LayerElementSource );

				ReferenceLayerElement	RLE = new ReferenceLayerElement();
										RLE.m_OwnerMesh = _OwnerMesh;
										RLE.m_LayerElement = _LayerElementReference;

				m_LayerElementsReference.Add( RLE );
			}

			#region Procedural Creation

			/// <summary>
			/// Creates a box mesh
			/// </summary>
			/// <param name="_BBox">The mesh's box in local space</param>
			/// <param name="_Material">The material to use for the box</param>
			public void		CreateBox( BoundingBox _BBox, Material _Material )
			{
				m_OverrideMaterial = _Material;

				// Build vertices
				Point[]	Vertices = new Point[8];

				Vertices[0] = new Point( _BBox.m_Min.x + 0 * _BBox.DimX, _BBox.m_Min.y + 0 * _BBox.DimY, _BBox.m_Min.z + 0 * _BBox.DimZ );
				Vertices[1] = new Point( _BBox.m_Min.x + 1 * _BBox.DimX, _BBox.m_Min.y + 0 * _BBox.DimY, _BBox.m_Min.z + 0 * _BBox.DimZ );
				Vertices[2] = new Point( _BBox.m_Min.x + 1 * _BBox.DimX, _BBox.m_Min.y + 1 * _BBox.DimY, _BBox.m_Min.z + 0 * _BBox.DimZ );
				Vertices[3] = new Point( _BBox.m_Min.x + 0 * _BBox.DimX, _BBox.m_Min.y + 1 * _BBox.DimY, _BBox.m_Min.z + 0 * _BBox.DimZ );
				Vertices[4] = new Point( _BBox.m_Min.x + 0 * _BBox.DimX, _BBox.m_Min.y + 0 * _BBox.DimY, _BBox.m_Min.z + 1 * _BBox.DimZ );
				Vertices[5] = new Point( _BBox.m_Min.x + 1 * _BBox.DimX, _BBox.m_Min.y + 0 * _BBox.DimY, _BBox.m_Min.z + 1 * _BBox.DimZ );
				Vertices[6] = new Point( _BBox.m_Min.x + 1 * _BBox.DimX, _BBox.m_Min.y + 1 * _BBox.DimY, _BBox.m_Min.z + 1 * _BBox.DimZ );
				Vertices[7] = new Point( _BBox.m_Min.x + 0 * _BBox.DimX, _BBox.m_Min.y + 1 * _BBox.DimY, _BBox.m_Min.z + 1 * _BBox.DimZ );

				SetVertices( Vertices );

				// Build faces
				FBXImporter.NodeMesh.Triangle[]	Faces = new FBXImporter.NodeMesh.Triangle[2*6];

				Faces[0] = new FBXImporter.NodeMesh.Triangle( 7, 4, 5, 0 );		// Front
				Faces[1] = new FBXImporter.NodeMesh.Triangle( 7, 5, 6, 1 );
				Faces[2] = new FBXImporter.NodeMesh.Triangle( 6, 5, 1, 2 );		// Right
				Faces[3] = new FBXImporter.NodeMesh.Triangle( 6, 1, 2, 3 );
				Faces[4] = new FBXImporter.NodeMesh.Triangle( 3, 7, 6, 4 );		// Top
				Faces[5] = new FBXImporter.NodeMesh.Triangle( 3, 6, 2, 5 );
				Faces[6] = new FBXImporter.NodeMesh.Triangle( 3, 0, 4, 6 );		// Left
				Faces[7] = new FBXImporter.NodeMesh.Triangle( 3, 4, 7, 7 );
				Faces[8] = new FBXImporter.NodeMesh.Triangle( 2, 1, 0, 8 );		// Back
				Faces[9] = new FBXImporter.NodeMesh.Triangle( 2, 0, 3, 9 );
				Faces[10] = new FBXImporter.NodeMesh.Triangle( 4, 0, 1, 10 );	// Bottom
				Faces[11] = new FBXImporter.NodeMesh.Triangle( 4, 1, 5, 11 );

				SetFaces( Faces );

				// Build smoothing groups
				object[]	SmoothingGroups = new object[]	{	1, 1,
																2, 2,
																4, 4,
																8, 8,
																16, 16,
																32, 32,
																64, 64 };

				FBXImporter.LayerElement	Element = new FBXImporter.LayerElement( "Smg", FBXImporter.LayerElement.ELEMENT_TYPE.SMOOTHING, FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE, 0 );
											Element.SetArrayOfData( SmoothingGroups );

				AddLayerElement( Element );

				// Build UV set (compulsory otherwise TS can't be generated and an exception may occur)
				object[]	UVs = new object[]
				{
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 0.0f, 1.0f ), new Vector2D( 1.0f, 1.0f ),
					new Vector2D( 0.0f, 0.0f ), new Vector2D( 1.0f, 1.0f ), new Vector2D( 1.0f, 0.0f ),
				};

				Element = new FBXImporter.LayerElement( "UVs", FBXImporter.LayerElement.ELEMENT_TYPE.UV, FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX, 0 );
				Element.SetArrayOfData( UVs );

				AddLayerElement( Element );

				// That's all, we don't build anything else as it will be done by the mesh consolidation...
			}

			#endregion

			/// <summary>
			/// This override builds the actual mesh to serialize
			/// </summary>
			public override void Commit()
			{
				if ( m_bGenerateTriangleStrips )
					throw new Exception( "Triangle Strips are not supported yet !" );

				// Setup the comparison flags used for consolidation
				ConsolidatedVertex.ms_CompareSmoothingGroups = m_Owner.m_bConsolidateSplitBySMG;
				ConsolidatedVertex.VertexInfo.ms_CompareUVs = m_Owner.m_bConsolidateSplitByUV;
				ConsolidatedVertex.VertexInfo.ms_CompareColors = m_Owner.m_bConsolidateSplitByColor;

				//////////////////////////////////////////////////////////////////////////
				// Reset X-Form
				if ( m_Pivot != null )
				{
					Point[]	NewVertices = new Point[m_Vertices.Length];
					for ( int VertexIndex=0; VertexIndex < m_Vertices.Length; VertexIndex++ )
						NewVertices[VertexIndex] = m_Vertices[VertexIndex] * m_Pivot;

					m_Vertices = NewVertices;
				}

				//////////////////////////////////////////////////////////////////////////
				// Build the original list of consolidated faces
				List<ConsolidatedFace>	Faces = new List<ConsolidatedFace>();
				foreach ( FBXImporter.NodeMesh.Triangle T in m_Faces )
				{
					ConsolidatedFace	NewFace = new ConsolidatedFace();
										NewFace.Index = Faces.Count;
										NewFace.VertexIndex0 = T.Vertex0;
										NewFace.VertexIndex1 = T.Vertex1;
										NewFace.VertexIndex2 = T.Vertex2;

					Faces.Add( NewFace );
				}

				//////////////////////////////////////////////////////////////////////////
				// Attempt to retrieve smoothing group & material data
				foreach ( FBXImporter.LayerElement Element in m_LayerElements )
				{
					if ( Element.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.MATERIAL )
					{
						if ( m_OverrideMaterial != null )
							continue;	// Ignore specific material if we have an override...

						// Retrieve the array of data
						object[]	Data = Element.ToArray();
						switch ( Element.MappingType )
						{
							case FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE:
								for ( int FaceIndex=0; FaceIndex < Faces.Count; FaceIndex++ )
									Faces[FaceIndex].Material = (FBXImporter.Material) Data[FaceIndex];
								break;

							case FBXImporter.LayerElement.MAPPING_TYPE.ALL_SAME:
								{
									FBXImporter.Material	Mat = (FBXImporter.Material) Data[0];
									foreach ( ConsolidatedFace F in Faces )
										F.Material = Mat;
									break;
								}

							default:
								throw new Exception( "Found a layer element of type \"MATERIAL\" with unsupported \"" + Element.MappingType + "\" mapping type!\r\n(Only BY_POLYGON & ALL_SAME mapping modes are supported!)" );
						}
					}
					else if ( Element.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.SMOOTHING )
					{
						// Retrieve the array of data
						object[]	Data = Element.ToArray();
						switch ( Element.MappingType )
						{
							case FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE:
								for ( int FaceIndex=0; FaceIndex < Faces.Count; FaceIndex++ )
									Faces[FaceIndex].SmoothingGroups = (int) Data[FaceIndex];
								break;

							case FBXImporter.LayerElement.MAPPING_TYPE.ALL_SAME:
								{
									int	SMG = (int) Data[0];
									foreach ( ConsolidatedFace F in Faces )
										F.SmoothingGroups = SMG;
									break;
								}

							default:
								throw new Exception( "Found a layer element of type \"SMOOTHING\" with unsupported \"" + Element.MappingType + "\" mapping type!\r\n(Only BY_POLYGON & ALL_SAME mapping modes are supported!)" );
						}
					}
				}

				//////////////////////////////////////////////////////////////////////////
				// Check if we have tangent space
				TANGENT_SPACE_AVAILABILITY	TSAvailability = TANGENT_SPACE_AVAILABILITY.NOTHING;

				foreach ( FBXImporter.LayerElement Element in m_LayerElements )
					switch ( Element.ElementType )
					{
						case FBXImporter.LayerElement.ELEMENT_TYPE.UV:
							TSAvailability |= TANGENT_SPACE_AVAILABILITY.UVs;
							break;

						case FBXImporter.LayerElement.ELEMENT_TYPE.NORMAL:
							TSAvailability |= TANGENT_SPACE_AVAILABILITY.NORMAL;
							break;

						case FBXImporter.LayerElement.ELEMENT_TYPE.TANGENT:
							TSAvailability |= TANGENT_SPACE_AVAILABILITY.TANGENT;
							break;

						case FBXImporter.LayerElement.ELEMENT_TYPE.BINORMAL:
							TSAvailability |= TANGENT_SPACE_AVAILABILITY.BINORMAL;
							break;
					}

				if ( TSAvailability == TANGENT_SPACE_AVAILABILITY.NOTHING )
				{	// Can't generate !
					switch ( m_Owner.m_NoTangentSpaceAction )
					{
						case NO_TANGENT_SPACE_ACTION.THROW:
							throw new Exception( "Can't generate Tangent Space because there is no texture coordinates !" );

						case NO_TANGENT_SPACE_ACTION.SKIP:
							return;
					}
				}


				//////////////////////////////////////////////////////////////////////////
				// Build dummy layer elements for position, normal, tangent & binormal streams of data
				//
				m_LayerElementPosition = new FBXImporter.LayerElement( "Position", FBXImporter.LayerElement.ELEMENT_TYPE.POSITION, FBXImporter.LayerElement.MAPPING_TYPE.BY_CONTROL_POINT, 0 );
				m_LayerElementPosition.SetArrayOfData( m_Vertices );
				m_LayerElements.Add( m_LayerElementPosition );

				m_LayerElementNormal = null;
				m_LayerElementTangent = null;
				m_LayerElementBiNormal = null;
				foreach ( FBXImporter.LayerElement LE in m_LayerElements )
				{
					if ( m_LayerElementNormal == null && LE.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.NORMAL )
					{	// Re-use the normals element
						m_LayerElementNormal = LE;
						m_LayerElementNormal.MappingType = FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX;
						m_LayerElementNormal.ReferenceType = FBXImporter.LayerElement.REFERENCE_TYPE.DIRECT;
					}
					else if ( m_LayerElementTangent == null && LE.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.TANGENT )
					{	// Re-use the tangents element
						m_LayerElementTangent = LE;
						m_LayerElementTangent.MappingType = FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX;
						m_LayerElementTangent.ReferenceType = FBXImporter.LayerElement.REFERENCE_TYPE.DIRECT;
					}
					else if ( m_LayerElementBiNormal == null && LE.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.BINORMAL )
					{	// Re-use the binormals element
						m_LayerElementBiNormal = LE;
						m_LayerElementBiNormal.MappingType = FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX;
						m_LayerElementBiNormal.ReferenceType = FBXImporter.LayerElement.REFERENCE_TYPE.DIRECT;
					}
				}

				if ( m_LayerElementNormal == null )
				{	// Create a new normals element
					m_LayerElementNormal = new FBXImporter.LayerElement( "Normal", FBXImporter.LayerElement.ELEMENT_TYPE.NORMAL, FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX, 0 );
					m_LayerElements.Add( m_LayerElementNormal );
				}
				if ( m_bGenerateMissingTangentSpace && m_LayerElementTangent == null )
				{	// Create a new tangents element
					m_LayerElementTangent = new FBXImporter.LayerElement( "Tangent", FBXImporter.LayerElement.ELEMENT_TYPE.TANGENT, FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX, 0 );
					m_LayerElements.Add( m_LayerElementTangent );
				}
				if ( m_bGenerateMissingTangentSpace && m_LayerElementBiNormal == null )
				{	// Create a new binormals element
					m_LayerElementBiNormal = new FBXImporter.LayerElement( "BiNormal", FBXImporter.LayerElement.ELEMENT_TYPE.BINORMAL, FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX, 0 );
					m_LayerElements.Add( m_LayerElementBiNormal );
				}


				//////////////////////////////////////////////////////////////////////////
				// Generate missing data
				BuildTangentSpace( Faces, TSAvailability, m_bGenerateMissingTangentSpace );


				//////////////////////////////////////////////////////////////////////////
				// Build primitives based on referenced materials
				m_Primitives.Clear();

				Dictionary<FBXImporter.Material,Primitive>	Material2Primitive = new Dictionary<FBXImporter.Material,Primitive>();
				Primitive	DefaultPrimitive = null;

				for ( int FaceIndex=0; FaceIndex < Faces.Count; FaceIndex++ )
				{
					ConsolidatedFace	F = Faces[FaceIndex];
					Primitive			P = null;
					if ( F.Material == null )
					{	// Default material
						if ( DefaultPrimitive == null )
						{	// Create the default primitive
							DefaultPrimitive = new Primitive( this, m_Owner, this.m_Name + "_Primitive" + m_Primitives.Count, null );
							DefaultPrimitive.OverrideMaterial = m_OverrideMaterial;	// Setup the optional override material
							m_Primitives.Add( DefaultPrimitive );
						}

						P = DefaultPrimitive;
					}
					else if ( !Material2Primitive.ContainsKey( F.Material ) )
					{	// New primitive!
						P = new Primitive( this, m_Owner, this.m_Name + "_Primitive" + m_Primitives.Count, F.Material );
						m_Primitives.Add( P );
						Material2Primitive[F.Material] = P;
					}
					else
						P = Material2Primitive[F.Material];

					P.AddFace( F );
				}

				// Validate the mesh
				base.Commit();
			}

			/// <summary>
			/// Generates the tangent space informations at face level (called by Commit())
			/// </summary>
			/// <param name="_Faces">The list of faces to build tangent space for</param>
			/// <param name="_TSAvailability">A combination of availability flags for tangent space reconstruction</param>
			/// <param name="_bGenerateMissingTangentSpace">Generates the missing tangent space data</param>
			public void		BuildTangentSpace( List<ConsolidatedFace> _Faces, TANGENT_SPACE_AVAILABILITY _TSAvailability, bool _bGenerateMissingTangentSpace )
			{
				bool	bHasUVs = (_TSAvailability & TANGENT_SPACE_AVAILABILITY.UVs) != 0;

				//////////////////////////////////////////////////////////////////////////
				// Build face normals
				//
				foreach ( ConsolidatedFace F in _Faces )
				{
					Point	V0 = m_Vertices[F.VertexIndex0];
					Point	V1 = m_Vertices[F.VertexIndex1];
					Point	V2 = m_Vertices[F.VertexIndex2];

					F.Normal = ((V2 - V1) ^ (V0 - V1));
					float	fLength = F.Normal.Magnitude();
					if ( fLength > 1e-6f )
						F.Normal /= fLength;
					else
						F.Normal = new Vector( 1, 0, 0 );
				}

				//////////////////////////////////////////////////////////////////////////
				// Here we handle the case where we're missing the some tangent space data and have a UV set to generate one from scratch
				//
				bool	bTangentsBinormalsAvailable = false;
//				if ( !_bGenerateMissingTangentSpace || (_TSAvailability & TANGENT_SPACE_AVAILABILITY.TANGENT_SPACE_ONLY) != TANGENT_SPACE_AVAILABILITY.TANGENT_SPACE_ONLY || !bHasUVs )
				if ( _bGenerateMissingTangentSpace && bHasUVs )
				{
					// Retrieve the UV layer element that will help us to compute the tangent space
					FBXImporter.LayerElement	UVLE = null;
					foreach ( FBXImporter.LayerElement LE in m_LayerElements )
						if ( LE.ElementType == FBXImporter.LayerElement.ELEMENT_TYPE.UV && (UVLE == null || LE.Index == 0) )
							UVLE = LE;	// Found a valid UV layer element !

					// Rebuild tangent space from UVs
					foreach ( ConsolidatedFace F in _Faces )
					{
						FBXImporter.NodeMesh.Triangle	T = m_Faces[F.Index];

						Point		V0 = m_Vertices[F.VertexIndex0];
						Point		V1 = m_Vertices[F.VertexIndex1];
						Point		V2 = m_Vertices[F.VertexIndex2];
						Vector2D	UV0 = UVLE.GetElementByTriangleVertex( F.Index, 0 ) as Vector2D;
						Vector2D	UV1 = UVLE.GetElementByTriangleVertex( F.Index, 1 ) as Vector2D;
						Vector2D	UV2 = UVLE.GetElementByTriangleVertex( F.Index, 2 ) as Vector2D;

						// Compute tangent using U gradient
						Vector		dV0 = V1 - V0;
						Vector		dV1 = V2 - V0;
						Vector2D 	dUV0 = UV1 - UV0;
						Vector2D 	dUV1 = UV2 - UV0;

						float	fDet = (dUV0.x * dUV1.y - dUV0.y * dUV1.x);
						if ( Math.Abs( fDet ) > 1e-6f )
						{
							float fIDet = 1.0f / fDet;
							F.Tangent = new Vector(		(dUV1.y * dV0.x - dUV0.y * dV1.x) * fIDet,
														(dUV1.y * dV0.y - dUV0.y * dV1.y) * fIDet,
														(dUV1.y * dV0.z - dUV0.y * dV1.z) * fIDet ).Normalize();
							F.BiNormal = -new Vector(	(dUV1.x * dV0.x - dUV0.x * dV1.x) * fIDet,
														(dUV1.x * dV0.y - dUV0.x * dV1.y) * fIDet,
														(dUV1.x * dV0.z - dUV0.x * dV1.z) * fIDet ).Normalize();
						}
						else
						{	// Singularity...
							F.Tangent = new Vector( 1, 0, 0 );
							F.BiNormal = new Vector( 0, 1, 0 );
						}
					}

					bTangentsBinormalsAvailable = true;
				}

				//////////////////////////////////////////////////////////////////////////
				// Build the list of faces that share a common vertex
				//
				Dictionary<int,List<SharedFace>>	Vertex2SharedFace = new Dictionary<int,List<SharedFace>>();
				Vector[]							Normals = new Vector[3*_Faces.Count];
				Vector[]							Tangents = new Vector[3*_Faces.Count];
				Vector[]							BiNormals = new Vector[3*_Faces.Count];

				for ( int VertexIndex=0; VertexIndex < m_Vertices.Length; VertexIndex++ )
					Vertex2SharedFace[VertexIndex] = new List<SharedFace>();

				foreach ( ConsolidatedFace F in _Faces )
				{
					Point		V0 = m_Vertices[F.VertexIndex0];
					Point		V1 = m_Vertices[F.VertexIndex1];
					Point		V2 = m_Vertices[F.VertexIndex2];

					SharedFace	SF0 = new SharedFace( F, V0, V1, V2 );
					SharedFace	SF1 = new SharedFace( F, V1, V2, V0 );
					SharedFace	SF2 = new SharedFace( F, V2, V0, V1 );

					Vertex2SharedFace[F.VertexIndex0].Add( SF0 );
					Vertex2SharedFace[F.VertexIndex1].Add( SF1 );
					Vertex2SharedFace[F.VertexIndex2].Add( SF2 );

					// Initialize normal, tangent & binormal for the 3 vertices of that face
					Normals[3*F.Index+0] = new Vector( 0, 0, 0 );
					Normals[3*F.Index+1] = new Vector( 0, 0, 0 );
					Normals[3*F.Index+2] = new Vector( 0, 0, 0 );

					Tangents[3*F.Index+0] = new Vector( 0, 0, 0 );
					Tangents[3*F.Index+1] = new Vector( 0, 0, 0 );
					Tangents[3*F.Index+2] = new Vector( 0, 0, 0 );

					BiNormals[3*F.Index+0] = new Vector( 0, 0, 0 );
					BiNormals[3*F.Index+1] = new Vector( 0, 0, 0 );
					BiNormals[3*F.Index+2] = new Vector( 0, 0, 0 );
				}

				//////////////////////////////////////////////////////////////////////////
				// Accumulate normals, tangents & binormals for each vertex according to their smoothing group
				//
				foreach ( ConsolidatedFace F in _Faces )
				{
					// Accumulate for vertex 0
					foreach ( SharedFace SF in Vertex2SharedFace[F.VertexIndex0] )
						if ( SF.m_Face == F || (SF.m_Face.SmoothingGroups & F.SmoothingGroups) != 0 )
						{	// Another face shares our smoothing groups !
							Normals[3*F.Index+0] += SF.m_Weight * SF.m_Face.Normal;
							if ( bTangentsBinormalsAvailable )
							{
								Tangents[3*F.Index+0] += SF.m_Weight * SF.m_Face.Tangent;
								BiNormals[3*F.Index+0] += SF.m_Weight * SF.m_Face.BiNormal;
							}
						}

					// Accumulate for vertex 1
					foreach ( SharedFace SF in Vertex2SharedFace[F.VertexIndex1] )
						if ( SF.m_Face == F || (SF.m_Face.SmoothingGroups & F.SmoothingGroups) != 0 )
						{	// Another face shares our smoothing groups !
							Normals[3*F.Index+1] += SF.m_Weight * SF.m_Face.Normal;
							if ( bTangentsBinormalsAvailable )
							{
								Tangents[3*F.Index+1] += SF.m_Weight * SF.m_Face.Tangent;
								BiNormals[3*F.Index+1] += SF.m_Weight * SF.m_Face.BiNormal;
							}
						}

					// Accumulate for vertex 2
					foreach ( SharedFace SF in Vertex2SharedFace[F.VertexIndex2] )
						if ( SF.m_Face == F || (SF.m_Face.SmoothingGroups & F.SmoothingGroups) != 0 )
						{	// Another face shares our smoothing groups !
							Normals[3*F.Index+2] += SF.m_Weight * SF.m_Face.Normal;
							if ( bTangentsBinormalsAvailable )
							{
								Tangents[3*F.Index+2] += SF.m_Weight * SF.m_Face.Tangent;
								BiNormals[3*F.Index+2] += SF.m_Weight * SF.m_Face.BiNormal;
							}
						}
				}

				//////////////////////////////////////////////////////////////////////////
				// Finally, normalize the normals, tangents & binormals
				//
				for ( int i=0; i < 3 * _Faces.Count; i++ )
				{
					Normals[i].Normalize();
					if ( bTangentsBinormalsAvailable )
					{
						Tangents[i].Normalize();
						BiNormals[i].Normalize();
					}
				}

				//////////////////////////////////////////////////////////////////////////
				// Set the data in the layer elements
				//
				m_LayerElementNormal.SetArrayOfData( Normals );
				if ( _bGenerateMissingTangentSpace )
				{
					m_LayerElementTangent.SetArrayOfData( Tangents );
					m_LayerElementBiNormal.SetArrayOfData( BiNormals );
				}
			}

			/// <summary>
			/// Performs mesh consolidation & builds missing tangent space
			/// </summary>
			public void		PerformConsolidation()
			{
				if ( !IsMaster )
					return;

				//////////////////////////////////////////////////////////////////////////
				// Build the list of layer elements, ours and external ones
				List<FBXImporter.LayerElement>	CollapsedLayerElements = new List<FBXImporter.LayerElement>();
				List<Mesh>						CollapsedLayerElementMeshes = new List<Mesh>();
				foreach ( FBXImporter.LayerElement Element in m_LayerElements )
				{
					CollapsedLayerElements.Add( Element );
					CollapsedLayerElementMeshes.Add( this );
				}
				foreach ( ExternalLayerElement Element in m_LayerElementsExternal )
				{
					CollapsedLayerElements.Add( Element.m_LayerElement );
					CollapsedLayerElementMeshes.Add( Element.m_OwnerMesh );
				}
				m_CollapsedLayerElements = CollapsedLayerElements.ToArray();
				m_CollapsedLayerElementMeshes = CollapsedLayerElementMeshes.ToArray();

				//////////////////////////////////////////////////////////////////////////
				// Consolidate each primitive
				foreach ( Primitive P in m_Primitives )
					P.Consolidate();
			}
 
			/// <summary>
			/// Builds a consolidated vertex
			/// </summary>
			/// <param name="_Face">The face referencing this vertex</param>
			/// <param name="_FaceVertexIndex">The index of the vertex in that face</param>
			/// <param name="_VertexIndex">The index of the vertex to build</param>
			/// <returns></returns>
			protected ConsolidatedVertex	BuildConsolidatedVertex( ConsolidatedFace _Face, int _FaceVertexIndex, int _VertexIndex )
			{
				ConsolidatedVertex	Result = new ConsolidatedVertex();

				// Setup its smoothing group
				Result.m_SmoothingGroups = _Face.SmoothingGroups;

				// Setup informations
				for ( int LayerElementIndex=0; LayerElementIndex < m_CollapsedLayerElements.Length; LayerElementIndex++ )
				{
					FBXImporter.LayerElement	Element = m_CollapsedLayerElements[LayerElementIndex];
					Mesh						OwnerMesh = m_CollapsedLayerElementMeshes[LayerElementIndex];

					if ( Element.MappingType != FBXImporter.LayerElement.MAPPING_TYPE.BY_EDGE )
					{
						// Translate information
						VERTEX_INFO_TYPE	InfoType = VERTEX_INFO_TYPE.UNKNOWN;
						switch ( Element.ElementType )
						{
							case FBXImporter.LayerElement.ELEMENT_TYPE.POSITION:
								InfoType = VERTEX_INFO_TYPE.POSITION;
								break;
							case FBXImporter.LayerElement.ELEMENT_TYPE.NORMAL:
								InfoType = VERTEX_INFO_TYPE.NORMAL;
								break;
							case FBXImporter.LayerElement.ELEMENT_TYPE.BINORMAL:
								InfoType = VERTEX_INFO_TYPE.BINORMAL;
								break;
							case FBXImporter.LayerElement.ELEMENT_TYPE.TANGENT:
								InfoType = VERTEX_INFO_TYPE.TANGENT;
								break;
							case FBXImporter.LayerElement.ELEMENT_TYPE.UV:
								InfoType = VERTEX_INFO_TYPE.TEXCOORD2;
								break;
							case FBXImporter.LayerElement.ELEMENT_TYPE.VERTEX_COLOR:
								InfoType = VERTEX_INFO_TYPE.COLOR_HDR;
								break;
						}

						if ( InfoType == VERTEX_INFO_TYPE.UNKNOWN )
							continue;	// Not supported...

						// Fill the info
						ConsolidatedVertex.VertexInfo	Info = new ConsolidatedVertex.VertexInfo();
														Info.m_OwnerMesh = OwnerMesh;
														Info.m_SourceLayerElement = Element;
														Info.m_Type = InfoType;
														Info.m_Index = Element.Index;

						object[]	Data = Element.ToArray();
						switch ( Element.MappingType )
						{
							case	FBXImporter.LayerElement.MAPPING_TYPE.BY_CONTROL_POINT:
								Info.m_Value = Data[_VertexIndex];
								break;

							case	FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE:
								Info.m_Value = Data[_Face.Index];
								break;

							case	FBXImporter.LayerElement.MAPPING_TYPE.BY_TRIANGLE_VERTEX:
								Info.m_Value = Data[3*_Face.Index + _FaceVertexIndex];
								break;

							case	FBXImporter.LayerElement.MAPPING_TYPE.ALL_SAME:
								Info.m_Value = Data[0];
								break;
						}

						Result.m_Infos.Add( Info );

						// Special treatment for position, normal, tangent & binormal...
						switch ( InfoType )
						{
							case	VERTEX_INFO_TYPE.POSITION:
								Result.m_PositionInfo = Info;
								break;
							case	VERTEX_INFO_TYPE.NORMAL:
								Result.m_NormalInfo = Info;
								break;
							case	VERTEX_INFO_TYPE.TANGENT:
								Result.m_TangentInfo = Info;
								break;
							case	VERTEX_INFO_TYPE.BINORMAL:
								Result.m_BinormalInfo = Info;
								break;
						}
					}
				}

				return	Result;
			}

			/// <summary>
			/// Attempts to merge this mesh with the provided master mesh
			/// If the provided mesh can be used as a master for this mesh then the identical layer elements are "shared by reference"
			///  and the layer elements that differ are kept in this mesh and added as external elements to the master mesh.
			/// 
			/// In the end, only the master meshes will be optimized, and this mesh's data along with them so all is left is to retrieve
			///  the optimized referenced data from the master mesh and make them our own.
			/// </summary>
			/// <returns>True if the merge was successful</returns>
			public bool					MergeWithMasterMesh( Mesh _Master )
			{
				if ( !_Master.IsMaster )
					return	false;	// Not a master mesh...

				// 1] Compare vertex, faces & primitives counts (easy comparison first)
				if ( m_Vertices.Length != _Master.m_Vertices.Length )
					return	false;	// Not identical !
				if ( m_Faces.Length != _Master.m_Faces.Length )
					return	false;	// Not identical !
				if ( m_Primitives.Count != _Master.m_Primitives.Count )
					return	false;	// Not identical !

				// 2] Compare each primitive's vertex & faces count
				for ( int PrimitiveIndex=0; PrimitiveIndex < m_Primitives.Count; PrimitiveIndex++ )
				{
					Primitive	P0 = m_Primitives[PrimitiveIndex];
					Primitive	P1 = _Master.m_Primitives[PrimitiveIndex];

					if ( P0.FacesCount != P1.FacesCount )
						return	false;	// Not identical !
				}

				// 3] Compare the vertices one by one
				for ( int VertexIndex=0; VertexIndex < m_Vertices.Length; VertexIndex++ )
				{
					Point	V0 = m_Vertices[VertexIndex];
					Point	V1 = _Master.m_Vertices[VertexIndex];
					if ( V0 != V1 )
						return	false;
				}

				// 4] Compare the faces one by one
				for ( int FaceIndex=0; FaceIndex < m_Faces.Length; FaceIndex++ )
				{
					FBXImporter.NodeMesh.Triangle	F0 = m_Faces[FaceIndex];
					FBXImporter.NodeMesh.Triangle	F1 = _Master.m_Faces[FaceIndex];
					if ( F0.Vertex0 != F1.Vertex0 || F0.Vertex1 != F1.Vertex1 || F0.Vertex2 != F1.Vertex2 )
						return	false;
				}

				//////////////////////////////////////////////////////////////////////////
				// At this point, the 2 meshes are deemed identical (up to the point of Vertices and Faces at least)
				//////////////////////////////////////////////////////////////////////////

				// Make this mesh a slave
				m_MasterMesh = _Master;

				// 5] Compare each of our Layer Elements to the master's and merge them
				//	_ Layer Elements that are identical to the master will be replaced by references to the master's
				//	_ Layer Elements that are different will be kept and will be added as external elements to the master
				//
				FBXImporter.LayerElement[]	LayerElements = m_LayerElements.ToArray();
				foreach ( FBXImporter.LayerElement LE0 in LayerElements )
				{
					FBXImporter.LayerElement	LE1 = null;
					foreach ( FBXImporter.LayerElement MasterLE in _Master.m_LayerElements )
						if ( LE0.Compare( MasterLE ) )
						{	// Found a match !
							LE1 = MasterLE;
							break;
						}

					if ( LE1 != null )
					{	// We found a matching layer element in the master mesh!
						// Now, we simply replace our own element by a reference to the master's element
						ReplaceLayerElementByAReference( LE0, _Master, LE1 );
					}
					else
					{	// We couldn't find a matching layer element!
						// That means this layer element is unique to our instance so we add it as an external element in the master mesh
						// When the master mesh will be consolidated, it will take our elements into account as well...
						_Master.AddExternalLayerElement( this, LE0 );
					}
				}

				return	true;
			}

			#endregion
		};

		public class	Material : SceneObject
		{
			#region FIELDS

			protected Dictionary<string,Texture>	m_TexturesDiffuse = new Dictionary<string,Texture>();
			protected Dictionary<string,Texture>	m_TexturesNormal = new Dictionary<string,Texture>();
			protected Dictionary<string,Texture>	m_TexturesRegular = new Dictionary<string,Texture>();

			#endregion

			#region PROPERTIES

			public Texture[]	DiffuseTextures
			{
				get
				{
					Texture[]	Result = new Texture[m_TexturesDiffuse.Count];
					m_TexturesDiffuse.Values.CopyTo( Result, 0 );

					return	Result;
				}
			}

			public Texture[]	NormalTextures
			{
				get
				{
					Texture[]	Result = new Texture[m_TexturesNormal.Count];
					m_TexturesNormal.Values.CopyTo( Result, 0 );

					return	Result;
				}
			}

			public Texture[]	RegularTextures
			{
				get
				{
					Texture[]	Result = new Texture[m_TexturesRegular.Count];
					m_TexturesRegular.Values.CopyTo( Result, 0 );

					return	Result;
				}
			}

			#endregion

			#region METHODS

			public Material( Serializer _Owner, string _Name ) : base( _Owner, _Name )
			{
			}

			/// <summary>
			/// Adds a diffuse texture to the material
			/// </summary>
			/// <param name="_TextureName">The name of the texture to add</param>
			/// <param name="_Texture">The texture to add</param>
			public void		AddTextureDiffuse( Texture _Texture )
			{
				if ( m_TexturesDiffuse.ContainsKey( _Texture.Name ) )
					throw new Exception( "Material \"" + m_Name + "\" already contains a DIFFUSE texture named \"" + _Texture.Name + "\" !" );

				_Texture.GenerateMipMaps = m_Owner.GenerateMipMapsDiffuse;
				m_TexturesDiffuse[_Texture.Name] = _Texture;
			}

			/// <summary>
			/// Adds a normal texture to the material
			/// </summary>
			/// <param name="_TextureName">The name of the texture to add</param>
			/// <param name="_Texture">The texture to add</param>
			public void		AddTextureNormal( Texture _Texture )
			{
				if ( m_TexturesNormal.ContainsKey( _Texture.Name ) )
					throw new Exception( "Material \"" + m_Name + "\" already contains a NORMAL texture named \"" + _Texture.Name + "\" !" );

				_Texture.GenerateMipMaps = m_Owner.GenerateMipMapsNormal;
				m_TexturesNormal[_Texture.Name] = _Texture;
			}

			/// <summary>
			/// Adds a generic texture to the material
			/// </summary>
			/// <param name="_TextureName">The name of the texture to add</param>
			/// <param name="_Texture">The texture to add</param>
			public void		AddTexture( Texture _Texture )
			{
				if ( m_TexturesRegular.ContainsKey( _Texture.Name ) )
					throw new Exception( "Material \"" + m_Name + "\" already contains a GENERIC texture named \"" + _Texture.Name + "\" !" );

				_Texture.GenerateMipMaps = m_Owner.GenerateMipMapsRegular;
				m_TexturesRegular[_Texture.Name] = _Texture;
			}

			#endregion
		};

		public class	Texture : SceneObject
		{
			#region NESTED TYPES

			protected enum	WRAP_MODE
			{
				WRAP,
				MIRROR,
				CLAMP,
				BORDER,
			}

			protected enum	FILTER_TYPE
			{
				NONE,
				POINT,
				LINEAR,
				ANISOTROPIC,
			}

			#endregion

			#region FIELDS

			protected string						m_SamplerName = null;
			protected FBXImporter.Texture			m_SourceTexture = null;
			protected bool							m_bEmbed = false;
			protected bool							m_bGenerateMipMaps = false;

			protected Dictionary<string,string>		m_SamplerParams = new Dictionary<string,string>();

			#endregion

			#region PROPERTIES

			/// <summary>
			/// Gets or sets the "Embed" flag telling if the texture should be embedded in the scene archive
			/// </summary>
			public bool		Embed
			{
				get { return m_bEmbed; }
				set { m_bEmbed = value; }
			}

			/// <summary>
			/// Gets or sets the "GenerateMipMaps" flag telling if the texture should generate multiple mip levels
			/// </summary>
			public bool		GenerateMipMaps
			{
				get { return m_bGenerateMipMaps; }
				set { m_bGenerateMipMaps = value; }
			}

			/// <summary>
			/// Gets or sets the name of the sampler that will reference that texture
			/// </summary>
			/// <remarks>
			/// If unspecified, the name of the sampler will be the name of the texture with "Sampler" appended
			/// </remarks>
			public string	SamplerName
			{
				get { return m_SamplerName != null ? m_SamplerName : (m_SourceTexture.Name + "Sampler"); }
				set { m_SamplerName = value; }
			}

			/// <summary>
			/// Gets the absolute name of the texture file
			/// </summary>
			public string	TextureFileName	{ get { return m_SourceTexture.AbsoluteFileName; } }

			/// <summary>
			/// Gets the dictionary of sampler params
			/// This will be serialized as "params" for a TextureSampler object in the JSON file
			/// </summary>
			public Dictionary<string,string>	SamplerParams
			{
				get { return m_SamplerParams; }
			}

			#endregion

			#region METHODS

			public Texture( Serializer _Owner, string _Name ) : base( _Owner, _Name )
			{
			}

			/// <summary>
			/// Sets a sampler param
			/// </summary>
			/// <param name="_Name">The name of the param to set</param>
			/// <param name="_Value">The value of the param (null clears the param)</param>
			public void		SetSamplerParam( string _Name, string _Value )
			{
				if ( _Value == null && m_SamplerParams.ContainsKey( _Name ) )
					m_SamplerParams.Remove( _Name );
				else
					m_SamplerParams[_Name] = _Value;
			}

			/// <summary>
			/// Sets the source FBX texture to get the parameters from
			/// </summary>
			/// <remarks>You can override individual parameters using the "SetSamplerParam()" function,
			///  if a parameter exists in the parameters table, it will be used instead
			///  of the one that would be generated from the texture
			/// </remarks>
			/// <param name="_Texture"></param>
			public void		SetSourceFBXTexture( FBXImporter.Texture _Texture )
			{
				m_SourceTexture = _Texture;

				// Build default sampler params
				SetSamplerParam( "o3d.addressModeU", Helpers.FormatParamObject( ConvertWrapMode( _Texture.WrapModeU ) ) );
				SetSamplerParam( "o3d.addressModeV", Helpers.FormatParamObject( ConvertWrapMode( _Texture.WrapModeV ) ) );
				SetSamplerParam( "o3d.borderColor", Helpers.FormatParamObject( new Vector4D( 0, 0, 0, 0 ) ) );
				SetSamplerParam( "o3d.magFilter", Helpers.FormatParamObject( (int) FILTER_TYPE.LINEAR ) );
				SetSamplerParam( "o3d.minFilter", Helpers.FormatParamObject( (int) FILTER_TYPE.LINEAR ) );
				SetSamplerParam( "o3d.mipFilter", Helpers.FormatParamObject( (int) FILTER_TYPE.LINEAR ) );
				SetSamplerParam( "o3d.maxAnisotropy", Helpers.FormatParamObject( 1 ) );
			}


			/// <summary>
			/// Converts an FBX wrap mode into an O3D wrap mode
			/// </summary>
			/// <param name="_WrapMode"></param>
			/// <returns></returns>
			protected int	ConvertWrapMode( FBXImporter.Texture.WRAP_MODE _WrapMode )
			{
				switch ( _WrapMode )
				{
					case FBXImporter.Texture.WRAP_MODE.CLAMP:
						return	(int) WRAP_MODE.CLAMP;

					case FBXImporter.Texture.WRAP_MODE.REPEAT:
						return	(int) WRAP_MODE.WRAP;
				}

				return	(int) WRAP_MODE.WRAP;
			}

			#endregion
		};

		public class	TextureCube : Texture
		{
			#region METHODS

			public TextureCube( Serializer _Owner, string _Name ) : base( _Owner, _Name )
			{
			}

			#endregion
		}

		#endregion

		/// <summary>
		/// The O3D scene uses the list of scene objects to build O3D-compatible objects, each of them being able
		///  to serialize as a part of the final JSON scene file.
		/// </summary>
		/// <remarks>
		/// Some of these O3D objects can provide binary files or buffers
		/// </remarks>
		public class	O3DScene
		{
			#region NESTED TYPES

			/// <summary>
			/// The list of object types supported by the scene
			/// </summary>
			/// <remarks>
			/// The order of declaration will determine the order of serialization
			/// Make sure the primitives are declared BEFORE the shapes otherwise, they will be added (and rendered!) twice when they get deserialized
			/// </remarks>
			public enum	OBJECT_TYPES
			{
				TRANSFORM,
				PRIMITIVE,
				SHAPE,
				MATERIAL,
				TEXTURE,
				TEXTURE_CUBE,
				TEXTURE_DELAY_LOADED,
				TEXTURE_SAMPLER,
				STREAM_BANK,

				// Animation
				PARAM_OBJECT,
				FUNCTION_EVAL,
				BUILD_VECTOR,
				MATRIXOP_TRANSLATION,
				MATRIXOP_ROTATION,
				MATRIXOP_SCALE,
				MATRIXOP_COMPOSITION,

				// Binary References
				VERTEX_BUFFER,
				INDEX_BUFFER,
				CURVE_BUFFER,
			}

				// The O3D type names equivalent to the above enumeration
			public static readonly string[]	O3D_TYPE_NAMES = new string[]
			{
				"o3d.Transform",
				"o3d.Primitive",
				"o3d.Shape",
				"o3d.Material",
				"o3d.Texture2D",
				"o3d.TextureCUBE",
				"Patapom.DelayLoadedTexture",		// Delay-loaded version of the textures (2D & CUBE alike)
				"o3d.Sampler",
				"o3d.StreamBank",

				// Animation
				"o3d.ParamObject",					// <= Used for the unique animation time controller
				"o3d.FunctionEval",					// <= Used to evaluate the curves
				"o3d.ParamOp3FloatsToFloat3",		// <= Used to build vectors (Position/Scale) from 3 individual floats
				"o3d.Matrix4Translation",			// <= Used for the Position tracks
				"o3d.Matrix4AxisRotation",			// <= Used for the Rotation tracks
				"o3d.Matrix4Scale",					// <= Used for the Scale tracks
				"o3d.Matrix4Composition",

				// Binary References
				"o3d.VertexBuffer",
				"o3d.IndexBuffer",
				"o3d.Curve",						// <= Used to store curve references
			};

				// The O3D param type names equivalent to the above enumeration
			public static readonly string[]	O3D_PARAM_TYPE_NAMES = new string[]
			{
				"o3d.???",
				"o3d.???",
				"o3d.???",
				"o3d.ParamMaterial",
				"o3d.ParamTexture",
				"o3d.ParamTexture",
				"o3d.ParamTexture",
				"o3d.ParamSampler",
				"o3d.ParamStreamBank",

				// Animation
				"o3d.ParamObject",
				"o3d.???",
				"o3d.ParamOp3FloatsToFloat3",
				"o3d.???",
				"o3d.???",
				"o3d.???",
				"o3d.???",

				// Binary References
				"o3d.ParamVertexBufferStream",
				"o3d.???",
				"o3d.???",
			};

			// Serialization units represent all kinds of objects that can be found in a JSON scene file.
			// The serialization process serializes the root unit that in turn serializes child units.
			//
			#region Serialization Units

			public abstract class	SerializationUnit
			{
				#region FIELDS

				protected string			m_Key = null;

				// Serialization data
				protected static bool		ms_bPrettyPrint = true;
				protected static string		ms_Indentation = "";

				#endregion

				#region PROPERTIES

				public string						Key			{ get { return m_Key; } }

				public abstract SerializationUnit	this[string _Key]	{ get; }

				public virtual SerializationObject	AsObject	{ get { return this as SerializationObject; } }

				public virtual SerializationArray	AsArray		{ get { return this as SerializationArray; } }

				public string						AsString	{ get { return ToString(); } }

				/// <summary>
				/// Gets or sets the pretty print flag for human readability
				/// </summary>
				public static bool			PrettyPrint
				{
					get { return ms_bPrettyPrint; }
					set { ms_bPrettyPrint = value; }
				}

				#endregion

				#region METHODS

				public SerializationUnit( string _Key )
				{
					m_Key = _Key;
				}

				public virtual void	Serialize( TextWriter _Writer )
				{
					_Writer.Write( ToString() );
				}

				#endregion
			};

			/// <summary>
			/// This unit type stores an object
			/// </summary>
			public class	SerializationObject : SerializationUnit
			{
				#region FIELDS

				protected Dictionary<string,SerializationUnit>	m_Key2Item = new Dictionary<string,SerializationUnit>();
				protected List<SerializationUnit>				m_Items = new List<SerializationUnit>();

				#endregion

				#region PROPERTIES

				public override SerializationUnit	this[string _Key]
				{
					get
					{
						foreach ( SerializationUnit Item in m_Items )
							if ( Item.Key == _Key )
								return	Item;

						return	null;
					}
				}

				#endregion

				#region METHODS

				public SerializationObject( string _Key ) : base( _Key )
				{
				}

				public SerializationUnit	AddItem( SerializationUnit _Item )
				{
					if ( _Item == null )
						return	null;
					if ( _Item.Key == null )
						throw new Exception( "Adding item without key !" );

					if ( m_Key2Item.ContainsKey( _Item.Key ) )
						return	m_Key2Item[_Item.Key];	// Already exists !

					m_Key2Item.Add( _Item.Key, _Item );
					m_Items.Add( _Item );

					return	_Item;
				}

				public override string	ToString()
				{
					if ( m_Items.Count == 0 )
						return	null;	// No need to serialize if no content...

					string	OldIndentation = ms_Indentation;
					ms_Indentation += "\t";

					// List non-empty items
					List<string>	ItemStrings = new List<string>();
					for ( int ItemIndex=0; ItemIndex < m_Items.Count; ItemIndex++ )
					{
						// Serialize the item
						string	ItemString = m_Items[ItemIndex].ToString();
						if ( ItemString != null )
							ItemStrings.Add( ItemString );
					}

					string	Result = null;
					if ( ms_bPrettyPrint )
					{
						// Write object start
						Result = OldIndentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + "{\r\n";

						// Serialize items
						for ( int ItemIndex=0; ItemIndex < ItemStrings.Count; ItemIndex++ )
						{
							Result += ItemStrings[ItemIndex];

							// Serialize a separator
							if ( ItemIndex < ItemStrings.Count-1 )	// I had to add this lousy condition because of the stoopid Microsoft guys who constrained the JS grammar ! FUCK YOU MS BOZOS !
								Result += ",";

							Result += "\r\n";
						}

						// Write object end
						Result += OldIndentation + "}";
					}
					else
					{
						// Write object start
						Result = (m_Key != null ? ("\"" + m_Key + "\":") : "") + "{";

						// Serialize items
						for ( int ItemIndex=0; ItemIndex < ItemStrings.Count; ItemIndex++ )
						{
							Result += ItemStrings[ItemIndex];

							// Serialize a separator
							if ( ItemIndex < ItemStrings.Count-1 )	// I had to add this lousy condition because of the stoopid Microsoft guys who constrained the JS grammar ! FUCK YOU MS BOZOS !
								Result += ",";
						}

						// Write object end
						Result += "}";
					}

					ms_Indentation = ms_Indentation.Remove( ms_Indentation.Length-1 );

					return	Result;
				}

				#endregion
			};

			/// <summary>
			/// This unit type stores an array of units
			/// </summary>
			public class	SerializationArray : SerializationUnit
			{
				#region FIELDS

				protected List<SerializationUnit>	m_Items = new List<SerializationUnit>();

				#endregion

				#region PROPERTIES

				public override SerializationUnit	this[string _Key]
				{
					get
					{
						foreach ( SerializationUnit Item in m_Items )
							if ( Item.Key == _Key )
								return	Item;

						return	null;
					}
				}

				#endregion

				#region METHODS

				public SerializationArray( string _Key ) : base( _Key )
				{
				}

				public SerializationUnit	AddItem( SerializationUnit _Item )
				{
					m_Items.Add( _Item );
					return	_Item;
				}

				public override string	ToString()
				{
					string	OldIndentation = ms_Indentation;
					ms_Indentation += "\t";

					// List non-empty items
					List<string>	ItemStrings = new List<string>();
					for ( int ItemIndex=0; ItemIndex < m_Items.Count; ItemIndex++ )
					{
						// Serialize the item
						string	ItemString = m_Items[ItemIndex].ToString();
						if ( ItemString != null )
							ItemStrings.Add( ItemString );
					}

					string	Result = null;
					if ( ms_bPrettyPrint )
					{
						// Write object start
						Result = OldIndentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + "[\r\n";

						// Serialize items
						for ( int ItemIndex=0; ItemIndex < ItemStrings.Count; ItemIndex++ )
						{
							Result += ItemStrings[ItemIndex];

							// Serialize a separator
							if ( ItemIndex < ItemStrings.Count-1 )	// Same reason... Microsoft jerks !
								Result += ",";

							Result += "\r\n";
						}

						// Write object end
						Result += OldIndentation + "]";
					}
					else
					{
						// Write object start
						Result = (m_Key != null ? ("\"" + m_Key + "\":") : "") + "[";

						// Serialize items
						for ( int ItemIndex=0; ItemIndex < ItemStrings.Count; ItemIndex++ )
						{
							Result += ItemStrings[ItemIndex];

							// Serialize a separator
							if ( ItemIndex < ItemStrings.Count-1 )	// Same reason... Microsoft jerks !
								Result += ",";
						}

						// Write object end
						Result += "]";
					}

					ms_Indentation = ms_Indentation.Remove( ms_Indentation.Length-1 );

					return	Result;
				}

				#endregion
			};

			/// <summary>
			/// This unit type formats a simple object value
			/// </summary>
			/// <example>"primitiveType" : 4</example>
			public class	SerializationSimpleValue : SerializationUnit
			{
				#region FIELDS

				protected object	m_Value = null;

				#endregion

				#region PROPERTIES

				public override SerializationUnit	this[string _Key]
				{
					get { return null; }
				}

				#endregion

				#region METHODS

				public SerializationSimpleValue( string _Key, object _Value ) : base( _Key )
				{
					m_Value = _Value;
				}

				public override string  ToString()
				{
					if ( ms_bPrettyPrint )
						return	ms_Indentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + Helpers.WriteObject( m_Value );

					return	(m_Key != null ? ("\"" + m_Key + "\":") : "") + Helpers.WriteObject( m_Value );
				}

				#endregion
			};

			/// <summary>
			/// This unit type formats a simple object value
			/// </summary>
			/// <example>"o3d.cull" : { "value" : false }</example>
			public class	SerializationParameter : SerializationSimpleValue
			{
				#region METHODS

				public SerializationParameter( string _Key, object _Value ) : base( _Key, _Value )
				{
				}

				public override string  ToString()
				{
					if ( ms_bPrettyPrint )
						return	ms_Indentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + Helpers.FormatStandardParameter( m_Value );

					return	(m_Key != null ? ("\"" + m_Key + "\":") : "") + Helpers.FormatStandardParameter( m_Value );
				}

				#endregion
			};

			/// <summary>
			/// This unit type formats a "Param" object value
			/// </summary>
			/// <example>"specular" : { "class" : "o3d.ParamFloat4", "value" : [0.9, 0.9, 0.9, 1] }</example>
			public class	SerializationParamObject : SerializationSimpleValue
			{
				#region METHODS

				public SerializationParamObject( string _Key, object _Value ) : base( _Key, _Value )
				{
				}

				public override string  ToString()
				{
					if ( ms_bPrettyPrint )
						return	ms_Indentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + Helpers.FormatParamObject( m_Value );

					return	(m_Key != null ? ("\"" + m_Key + "\":") : "") + Helpers.FormatParamObject( m_Value );
				}

				#endregion
			};

			/// <summary>
			/// This unit type stores a simple string
			/// </summary>
			/// <example>"myCustomData" : SomeStuffWrittenAsProvided</example>
			public class	SerializationRawString : SerializationUnit
			{
				#region FIELDS

				protected string	m_Value = null;

				#endregion

				#region PROPERTIES

				public override SerializationUnit	this[string _Key]
				{
					get { return null; }
				}

				#endregion

				#region METHODS

				public SerializationRawString( string _Key, string _Value ) : base( _Key )
				{
					m_Value = _Value;
				}

				public override string ToString()
				{
					if ( ms_bPrettyPrint )
						return ms_Indentation + (m_Key != null ? ("\"" + m_Key + "\" : ") : "") + m_Value;

					return (m_Key != null ? ("\"" + m_Key + "\":") : "") + m_Value;
				}

				#endregion
			};

			#endregion

			[System.Diagnostics.DebuggerDisplay( "Name={Name} Type={ObjectType} UniqueID={UniqueID}" )]
			public abstract class	O3DObject
			{
				#region FIELDS

				protected SceneObject	m_SourceObject = null;
				protected string		m_Name = null;
				protected int			m_UniqueID = -1;
				protected O3DObject		m_Parent = null;

				#endregion

				#region PROPERTIES

				/// <summary>
				/// Gets the sampler name
				/// </summary>
				public string		Name	{ get { return m_Name; } }

				/// <summary>
				/// Gets or sets the object's parent
				/// </summary>
				public O3DObject	Parent
				{
					get { return m_Parent; }
					set { m_Parent = value; }
				}

				/// <summary>
				/// Gets the object's Unique ID
				/// </summary>
				public int			UniqueID
				{
					get { return m_UniqueID; }
				}

				/// <summary>
				/// Gets the object type
				/// </summary>
				public abstract OBJECT_TYPES	ObjectType	{ get; }

				#endregion

				#region METHODS

				public O3DObject( SceneObject _SourceObject, string _Name, int _UniqueID )
				{
					m_SourceObject = _SourceObject;
					m_Name = _Name;
					m_UniqueID = _UniqueID;
				}

				/// <summary>
				/// Builds the standard serialization unit object, containing the ID, a "properties", "param" and "custom" section,
				/// the object name and an optional "parent" field if the parent is valid
				/// </summary>
				/// <returns></returns>
				public virtual SerializationUnit	BuildSerializationObject()
				{
					return	BuildBaseSerializationObject();
				}

				protected SerializationUnit	BuildBaseSerializationObject()
				{
					SerializationObject	Root = new SerializationObject( null );

					Root.AddItem( new SerializationSimpleValue( "id", m_UniqueID ) );
					Root.AddItem( new SerializationObject( "properties" ) );
					Root.AddItem( new SerializationObject( "params" ) );
					Root.AddItem( new SerializationObject( "custom" ) );
					Root["properties"].AsObject.AddItem( new SerializationSimpleValue( "name", m_Name ) );
					if ( m_Parent != null )
						Root["properties"].AsObject.AddItem( new SerializationSimpleValue( "parent", m_Parent ) );

					// Copy the source object's stuff
					if ( m_SourceObject != null )
					{
						CopyProperties( Root, m_SourceObject );
						CopyParameters( Root, m_SourceObject );
						CopyCustom( Root, m_SourceObject );
					}

					return	Root;
				}

				#region Serialization Helpers

				protected void				CopyProperties( SerializationUnit _Root, SceneObject _SourceObject )
				{
					foreach ( string PropName in _SourceObject.Properties.Keys )
						AddProperty( _Root, new SerializationRawString( PropName, _SourceObject.Properties[PropName] ) );
				}

				protected void				CopyParameters( SerializationUnit _Root, SceneObject _SourceObject )
				{
					foreach ( string ParamName in _SourceObject.Params.Keys )
						AddParam( _Root, new SerializationRawString( ParamName, _SourceObject.Params[ParamName] ) );
				}

				protected void				CopyCustom( SerializationUnit _Root, SceneObject _SourceObject )
				{
					foreach ( string CustomName in _SourceObject.Custom.Keys )
						AddCustom( _Root, new SerializationRawString( CustomName, _SourceObject.Custom[CustomName] ) );
				}

				/// <summary>
				/// Adds a "property" object
				/// </summary>
				/// <param name="_Root"></param>
				/// <param name="_Property"></param>
				/// <returns></returns>
				protected SerializationUnit	AddProperty( SerializationUnit _Root, SerializationUnit _Property )
				{
					_Root["properties"].AsObject.AddItem( _Property );
					return	_Property;
				}

				/// <summary>
				/// Adds a "params" object
				/// </summary>
				/// <param name="_Root"></param>
				/// <param name="_Param"></param>
				/// <returns></returns>
				protected SerializationUnit	AddParam( SerializationUnit _Root, SerializationUnit _Param )
				{
					_Root["params"].AsObject.AddItem( _Param );
					return	_Param;
				}

				/// <summary>
				/// Adds a "custom" object
				/// </summary>
				/// <param name="_Root"></param>
				/// <param name="_Custom"></param>
				/// <returns></returns>
				protected SerializationUnit	AddCustom( SerializationUnit _Root, SerializationUnit _Custom )
				{
					_Root["custom"].AsObject.AddItem( _Custom );
					return	_Custom;
				}

				/// <summary>
				/// Binds an input parameter to an object with the provided ID
				/// </summary>
				/// <param name="_Root"></param>
				/// <param name="_ParamName">The name of the parameter to bind</param>
				/// <param name="_BindToID">The ID of the object to bind to</param>
				protected void				BindInput( SerializationUnit _Root, string _ParamName, int _BindToID )
				{
					SerializationObject	BindObject = new SerializationObject( null );
										BindObject.AddItem( new SerializationSimpleValue( "bind", _BindToID ) );

					AddParam( _Root, new SerializationRawString( _ParamName, BindObject.ToString() ) );
				}

				/// <summary>
				/// Binds an output parameter to an object with the provided ID
				/// </summary>
				/// <param name="_Root"></param>
				/// <param name="_ParamName">The name of the parameter to bind</param>
				/// <param name="_BindToID">The ID of the object to bind to</param>
				protected void				BindOutput( SerializationUnit _Root, string _ParamName, int _BindToID )
				{
					SerializationObject	BindObject = new SerializationObject( null );
										BindObject.AddItem( new SerializationSimpleValue( "id", _BindToID ) );

					AddParam( _Root, new SerializationRawString( _ParamName, BindObject.ToString() ) );
				}

				#endregion

				#endregion
			};

			protected class	O3DTransform : O3DObject
			{
				#region FIELDS

				protected Matrix4x4			m_Transform = null;
				protected int				m_AnimationBindingID = -1;
				protected List<O3DShape>	m_Shapes = new List<O3DShape>();

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.TRANSFORM; } }

				#endregion

				#region METHODS

				public O3DTransform( SceneObject _SourceObject, string _Name, int _UniqueID, Matrix4x4 _Transform ) : base( _SourceObject, _Name, _UniqueID )
				{
					m_Transform = _Transform;
				}

				public O3DTransform( SceneObject _SourceObject, string _Name, int _UniqueID, int _AnimationBindingID ) : base( _SourceObject, _Name, _UniqueID )
				{
					m_AnimationBindingID = _AnimationBindingID;
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();
					
					if ( m_Parent == null )
					{	// Parent to the root by default...
						Root["properties"].AsObject.AddItem( new SerializationRawString( "parent", "{ \"ref\" : 1 }" ) );	// 1 is the root object's ID
					}

					// Build the array of shapes
					SerializationArray	ShapesArray = Root["properties"].AsObject.AddItem( new SerializationArray( "shapes" ) ).AsArray;
					foreach ( O3DShape Shape in m_Shapes )
						ShapesArray.AddItem( new SerializationSimpleValue( null, Shape ) );

					// Add some params
					AddParam( Root, new SerializationRawString( "o3d.boundingBox", "{ \"value\" : [] }" ) );	// Don't know the bounding-box format
					AddParam( Root, new SerializationSimpleValue( "o3d.cull", false ) );
					AddParam( Root, new SerializationSimpleValue( "o3d.visible", true ) );

					// The infamous local matrix
					if ( m_Transform != null )
						AddParam( Root, new SerializationParameter( "o3d.localMatrix", m_Transform ) );	// Static object
					else
						BindInput( Root, "o3d.localMatrix", m_AnimationBindingID );	// Dynamic object

					return	Root;
				}

				public void		AddShape( O3DShape _Shape )
				{
					m_Shapes.Add( _Shape );
				}

				#endregion
			};

			#region Materials

			protected class	O3DMaterial : O3DObject
			{
				#region FIELDS

				protected Material	m_SourceMaterial = null;

				// The list of referenced samplers
				protected List<O3DTextureSampler>	m_Samplers = new List<O3DTextureSampler>();

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.MATERIAL; } }

				#endregion

				#region METHODS

				public O3DMaterial( string _Name, int _UniqueID, Material _SourceMaterial ) : base( _SourceMaterial, _Name, _UniqueID )
				{
					m_SourceMaterial = _SourceMaterial;
				}

				/// <summary>
				/// Adds a texture sampler referenced by this material
				/// </summary>
				/// <param name="_Sampler"></param>
				public void		AddTextureSampler( O3DTextureSampler _Sampler )
				{
					m_Samplers.Add( _Sampler );
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();

					// Copy the source material stuff
					CopyProperties( Root, m_SourceMaterial );
					CopyParameters( Root, m_SourceMaterial );
					CopyCustom( Root, m_SourceMaterial );

					// Setup null drawlist & effect
					AddParam( Root, new SerializationRawString( "o3d.drawList", "{ \"value\" : null }" ) );
					AddParam( Root, new SerializationRawString( "o3d.effect", "{ \"value\" : null }" ) );

					// Add sampler references
					foreach ( O3DTextureSampler Sampler in m_Samplers )
						AddParam( Root, new SerializationParamObject( Sampler.Name, Sampler ) );

					return	Root;
				}

				#endregion
			}

			protected class	O3DTextureSampler : O3DObject
			{
				#region FIELDS

				protected Texture		m_SourceTexture = null;	// The source FBX texture to get parameters from
				protected O3DTexture2D	m_O3DTexture = null;	// The referenced O3D texture

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.TEXTURE_SAMPLER; } }

				#endregion

				#region METHODS

				public O3DTextureSampler( string _Name, int _UniqueID, Texture _SourceTexture, O3DTexture2D _O3DTexture ) : base( null, _Name, _UniqueID )
				{
					if ( _SourceTexture == null )
						throw new Exception( "Invalid source teexture !" );

					m_SourceTexture = _SourceTexture;
					m_O3DTexture = _O3DTexture;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					// Copy the source texture's Sampler Parameters as our params
					foreach ( string ParamName in m_SourceTexture.SamplerParams.Keys )
						AddParam( Root, new SerializationRawString( ParamName, m_SourceTexture.SamplerParams[ParamName] ) );

					// Build the texture reference
					if ( m_O3DTexture != null )
						AddParam( Root, new SerializationParameter( "o3d.texture", m_O3DTexture ) );
					else
						AddCustom( Root, new SerializationSimpleValue( "textureFileName", m_SourceTexture.TextureFileName ) );

					return	Root;
				}

				#endregion
			}

			protected class	O3DTexture2D : O3DObject, IFilesProvider
			{
				#region NESTED TYPES

				protected enum	FORMAT
				{
					UNKNOWN_FORMAT,
					XRGB8,  // actual format in memory is B G R X
					ARGB8,  // actual format in memory is B G R A
					ABGR16F,
					R32F,
					ABGR32F,
					DXT1,
					DXT3,
					DXT5,
				}

				#endregion

				#region FIELDS

				protected Texture	m_SourceTexture = null;

				protected int		m_Width = 0;
				protected int		m_Height = 0;

				// Referencer samplers
				protected List<O3DTextureSampler>	m_ReferencerSamplers = new List<O3DTextureSampler>();

				// Converted texture data
				protected string	m_ConvertedTextureName = null;
				protected byte[]	m_ConvertedTexture = null;
				protected FORMAT	m_ConvertedTextureFormat = FORMAT.UNKNOWN_FORMAT;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.TEXTURE; } }

				#region IFilesProvider Members

				public int FilesCount
				{
					get { return m_ConvertedTexture != null ? 1 : 0; }
				}

				public string[] FileNames
				{
					get { return m_ConvertedTextureName != null ? new string[] { m_ConvertedTextureName } : new string[0]; }
				}

				public byte[][] Files
				{
					get { return m_ConvertedTexture != null ? new byte[][] { m_ConvertedTexture } : new byte[][] {}; }
				}

				public DirectoryInfo	TargetDirectory
				{
					get { return m_SourceTexture != null ? m_SourceTexture.Owner.TargetTexturesBaseDirectory : null; }
				}

				#endregion

				public O3DTextureSampler[]	ReferencerSamplers
				{
					get { return m_ReferencerSamplers.ToArray(); }
				}

				#endregion

				#region METHODS

				public O3DTexture2D( Texture _SourceTexture, string _Name, int _UniqueID ) : base( _SourceTexture, _Name, _UniqueID )
				{
					m_SourceTexture = _SourceTexture;
				}

				/// <summary>
				/// Adds a new sampler referencing that texture
				/// </summary>
				/// <param name="_Sampler"></param>
				public void		AddReferencerSampler( O3DTextureSampler _Sampler )
				{
					m_ReferencerSamplers.Add( _Sampler );
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					// Copy the source texture stuff
					if ( m_SourceTexture != null )
					{
						CopyProperties( Root, m_SourceTexture );
						CopyParameters( Root, m_SourceTexture );
						CopyCustom( Root, m_SourceTexture );
					}

					// Write the URI parameter
					AddParam( Root, new SerializationParamObject( "o3d.uri", m_ConvertedTextureName ) );

					// Write custom parameters
					if ( m_Width > 0 )
						AddCustom( Root, new SerializationSimpleValue( "width", m_Width ) );
					if ( m_Height > 0 )
						AddCustom( Root, new SerializationSimpleValue( "height", m_Height ) );
					AddCustom( Root, new SerializationSimpleValue( "renderSurfaceEnabled", false ) );
					AddCustom( Root, new SerializationSimpleValue( "format", (int) m_ConvertedTextureFormat ) );

					int	MipLevelsCount = m_SourceTexture != null && m_SourceTexture.GenerateMipMaps && m_Width > 0 && m_Height > 0 ? 1 + (int) Math.Floor( Math.Log( Math.Max( m_Width, m_Height ) ) / Math.Log( 2 ) ) : 1;
					AddCustom( Root, new SerializationSimpleValue( "levels", MipLevelsCount ) );

					return	Root;
				}

				#region Conversion

				/// <summary>
				/// Try and convert the texture to the desired format
				/// </summary>
				/// <param name="_ConversionType">The type of conversion needed by the </param>
				/// <param name="_JPEGQuality">The JPEG quality parameter (used only by the JPEG conversion, obviously)</param>
				public void		Convert( TEXTURE_CONVERSION_TYPES _ConversionType, int _JPEGQuality )
				{
					//////////////////////////////////////////////////////////////////////////
					// Try and load the file
					FileInfo					ImageFile = null;
					System.Drawing.Bitmap		B = null;

					try
					{
						ImageFile = new FileInfo( m_SourceTexture.TextureFileName );
						if ( !ImageFile.Exists )
							throw new Exception( "File does not exist on disk !" );

						// Try and load the texture file
						switch ( Path.GetExtension( ImageFile.FullName ).ToUpper() )
						{
							case ".PNG":
								if ( _ConversionType == TEXTURE_CONVERSION_TYPES.PNG )
									_ConversionType = TEXTURE_CONVERSION_TYPES.NONE;	// No need to convert

								B = new System.Drawing.Bitmap( m_SourceTexture.TextureFileName );
								break;

							case ".BMP":
								B = new System.Drawing.Bitmap( m_SourceTexture.TextureFileName );
								break;

							case ".JPG":
								if ( _ConversionType == TEXTURE_CONVERSION_TYPES.JPG )
									_ConversionType = TEXTURE_CONVERSION_TYPES.NONE;	// No need to convert

								B = new System.Drawing.Bitmap( m_SourceTexture.TextureFileName );
								break;

							case ".TGA":
							{
								try
								{
									FileStream	Stream = ImageFile.OpenRead();
									B = O3DHelpers.TGALoader.LoadTGA( Stream );
									Stream.Close();
								}
								catch ( Exception _e )
								{
									throw new Exception( "An error occurred while loading TGA format !", _e );
								}
								break;
							}

							case ".TIFF":
							case ".DDS":
								_ConversionType = TEXTURE_CONVERSION_TYPES.NONE;		// Never convert these files !
								break;
						}

						if ( B != null )
						{	// Read dimensions
							m_Width = B.Width;
							m_Height = B.Height;
						}
					}
					catch ( Exception _e )
					{
						throw new Exception( "An error occurred while attempting to load the texture file \"" + m_SourceTexture.TextureFileName + "\" !", _e );
					}

					//////////////////////////////////////////////////////////////////////////
					// Perform actual conversion
					switch ( _ConversionType )
					{
						case	TEXTURE_CONVERSION_TYPES.NONE:
						{	// Store the texture as is...
							FileStream	S = ImageFile.OpenRead();
							m_ConvertedTexture = new byte[S.Length];
							S.Read( m_ConvertedTexture, 0, (int) S.Length );
							S.Close();

							m_ConvertedTextureName = Path.GetFileName( ImageFile.FullName ).Replace( '\\', '/' );	// Same name
							m_ConvertedTextureFormat = FORMAT.ARGB8;
							break;
						}

						case TEXTURE_CONVERSION_TYPES.JPG:
						{	// Store the texture as JPG
							System.Drawing.Imaging.ImageCodecInfo	ImageCodecInfo = GetEncoderInfo( "image/jpeg" );

							System.Drawing.Imaging.EncoderParameters	Params = new System.Drawing.Imaging.EncoderParameters( 1 );
							Params.Param[0] = new System.Drawing.Imaging.EncoderParameter( System.Drawing.Imaging.Encoder.Compression, 80L );

							MemoryStream	S = new MemoryStream();
							B.Save( S, ImageCodecInfo, Params );
							S.Close();
							m_ConvertedTexture = S.ToArray();

							m_ConvertedTextureName = (Path.GetFileNameWithoutExtension( ImageFile.FullName ) + ".jpg").Replace( '\\', '/' );
							m_ConvertedTextureFormat = FORMAT.XRGB8;	// No alpha
							break;
						}

						case TEXTURE_CONVERSION_TYPES.PNG:
						{
							MemoryStream	S = new MemoryStream();
							B.Save( S, System.Drawing.Imaging.ImageFormat.Png );
							S.Close();
							m_ConvertedTexture = S.ToArray();

							m_ConvertedTextureName = (Path.GetFileNameWithoutExtension( ImageFile.FullName ) + ".png").Replace( '\\', '/' );
							m_ConvertedTextureFormat = FORMAT.ARGB8;
							break;
						}

						default:
							throw new Exception( "Specified image format \"" + _ConversionType.ToString() + "\" is not supported yet !\r\nUse NO_CONVERSION, JPEG or PNG for now..." );
					}
				}

				/// <summary>
				/// Gets the image encoder codec based on the provided MIME type
				/// </summary>
				/// <param name="_MIMEType"></param>
				/// <returns></returns>
				protected System.Drawing.Imaging.ImageCodecInfo	GetEncoderInfo( string _MIMEType )
				{
					System.Drawing.Imaging.ImageCodecInfo[] encoders = System.Drawing.Imaging.ImageCodecInfo.GetImageEncoders();
					for ( int j=0; j < encoders.Length; ++j )
						if ( encoders[j].MimeType == _MIMEType )
							return encoders[j];
					
					return	null;
				}

				#endregion

				#endregion
			}

			protected class	O3DTextureCube : O3DTexture2D
			{
				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.TEXTURE_CUBE; } }

				#endregion

				#region METHODS

				public O3DTextureCube( Texture _SourceTexture, string _Name, int _UniqueID ) : base( _SourceTexture, _Name, _UniqueID )
				{
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = BuildBaseSerializationObject();

					// Copy the source texture stuff
					if ( m_SourceTexture != null )
					{
						CopyProperties( Root, m_SourceTexture );
						CopyParameters( Root, m_SourceTexture );
						CopyCustom( Root, m_SourceTexture );
					}

					// Write the URI parameter if the texture is to be embedded
					AddParam( Root, new SerializationParamObject( "o3d.uri", m_ConvertedTextureName ) );

					// Write custom parameters
					if ( m_Width > 0 )
						AddCustom( Root, new SerializationSimpleValue( "edgeLength", m_Width ) );
					AddCustom( Root, new SerializationSimpleValue( "renderSurfaceEnabled", false ) );

					return	Root;
				}

				#endregion
			}

			#region Delay-Loaded Textures

			protected class	O3DTexture_DelayLoaded : O3DTexture2D
			{
				#region FIELDS

				protected O3DTexture2D		m_DummyTexture = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES	ObjectType		{ get { return OBJECT_TYPES.TEXTURE_DELAY_LOADED; } }

				/// <summary>
				/// Gets the dummy texture
				/// The dummy texture is the temporary texture 
				/// </summary>
				public O3DTexture2D				DummyTexture
				{
					get { return m_DummyTexture; }
				}

				#endregion

				#region METHODS

				public O3DTexture_DelayLoaded( Texture _SourceTexture, string _Name, int _UniqueID, O3DTexture2D _DummyTexture ) : base( _SourceTexture, _Name, _UniqueID )
				{
					m_DummyTexture = _DummyTexture;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
					if ( m_SourceTexture == null )
						throw new Exception( "Failed to setup a valid source texture to reference !" );

 					SerializationUnit	Root = BuildBaseSerializationObject();

					// Write the URI parameter
					AddProperty( Root, new SerializationSimpleValue( "TextureURI", m_ConvertedTextureName ) );

					// Write the GenerateMipMaps parameter
					AddProperty( Root, new SerializationSimpleValue( "GenerateMipMaps", m_SourceTexture.GenerateMipMaps ) );

					// Write referencer samplers
					SerializationArray	ReferencersArray = new SerializationArray( "ReferencerSamplers" );
					foreach ( O3DTextureSampler RefSampler in m_ReferencerSamplers )
					{
						SerializationObject	Obj = new SerializationObject( null );
											Obj.AddItem( new SerializationRawString( "ref", RefSampler.UniqueID.ToString() ) );
						ReferencersArray.AddItem( Obj );
					}

					AddProperty( Root, ReferencersArray );

					return	Root;
				}

				#endregion
			};

			protected class	O3DTexture_Dummy : O3DTexture2D
			{
				#region METHODS

				public	O3DTexture_Dummy( string _Name, int _UniqueID, string _FileName, System.Drawing.Bitmap _DummyBitmap ) : base( null, _Name, _UniqueID )
				{
					MemoryStream	Stream = new MemoryStream();
					_DummyBitmap.Save( Stream, System.Drawing.Imaging.ImageFormat.Png );
					m_ConvertedTexture = Stream.ToArray();

					m_ConvertedTextureName = _FileName;
					m_ConvertedTextureFormat = FORMAT.ARGB8;
					m_Width = _DummyBitmap.Width;
					m_Height = _DummyBitmap.Height;
				}

				#endregion
			};

			protected class	O3DTexture_DummyCube : O3DTextureCube
			{
				#region METHODS

				public	O3DTexture_DummyCube( string _Name, int _UniqueID, string _FileName, byte[] _DummyCubeMap ) : base( null, _Name, _UniqueID )
				{
					m_ConvertedTexture = _DummyCubeMap;
					m_ConvertedTextureName = _FileName;
					m_ConvertedTextureFormat = FORMAT.ARGB8;
				}

				#endregion
			};

			#endregion

			#endregion

			#region Shapes

			protected class	O3DShape : O3DObject
			{
				#region FIELDS

				protected Mesh					m_SourceMesh = null;

				protected List<O3DPrimitive>	m_Primitives = new List<O3DPrimitive>();
				protected O3DStreamBank			m_StreamBank = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.SHAPE; } }

				public O3DStreamBank		StreamBank		{ get { return m_StreamBank; } }

				#endregion

				#region METHODS

				public O3DShape( Mesh _SourceMesh, string _Name, int _UniqueID ) : base( _SourceMesh, _Name, _UniqueID )
				{
					m_SourceMesh = _SourceMesh;
				}

				public void		AddPrimitive( O3DPrimitive _Primitive )
				{
					m_Primitives.Add( _Primitive );
				}

				public void		SetStreamBank( O3DStreamBank _Bank )
				{
					m_StreamBank = _Bank;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					// Copy the source mesh stuff
					CopyProperties( Root, m_SourceMesh );
					CopyParameters( Root, m_SourceMesh );
					CopyCustom( Root, m_SourceMesh );

					// Write the primitive elements
					SerializationArray	PrimitivesArray = AddProperty( Root, new SerializationArray( "elements" ) ).AsArray;
					foreach ( O3DPrimitive P in m_Primitives )
						PrimitivesArray.AddItem( new SerializationSimpleValue( null, P ) );

					return	Root;
				}

				#endregion
			};

			protected class	O3DPrimitive : O3DObject
			{
				#region NESTED TYPES

				public enum	PRIMITIVE_TYPE
				{
					POINTLIST = 1,      // Point list
					LINELIST = 2,       // Line list
					LINESTRIP = 3,      // Line Strip
					TRIANGLELIST = 4,   // Triangle List
					TRIANGLESTRIP = 5,  // Triangle Strip
					TRIANGLEFAN = 6,    // Triangle fan
				}

				#endregion

				#region FIELDS

				protected O3DShape			m_Owner = null;
				protected O3DMaterial		m_Material = null;
				protected O3DStreamBank		m_StreamBank = null;
				protected O3DIndexBuffer	m_IndexBuffer = null;

				protected PRIMITIVE_TYPE	m_Type = PRIMITIVE_TYPE.TRIANGLELIST;
				protected int				m_VerticesCount = -1;
				protected int				m_PrimitivesCount = -1;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.PRIMITIVE; } }

				#endregion

				#region METHODS

				public O3DPrimitive( string _Name, int _UniqueID, O3DShape _Owner, O3DMaterial _Material, O3DStreamBank _StreamBank, O3DIndexBuffer _IndexBuffer, PRIMITIVE_TYPE _Type, int _VerticesCount, int _PrimitivesCount ) : base( null, _Name, _UniqueID )
				{
					m_Owner = _Owner;
					m_Material = _Material;
					m_StreamBank = _StreamBank;
					m_IndexBuffer = _IndexBuffer;

					m_Type = _Type;
					m_VerticesCount = _VerticesCount;
					m_PrimitivesCount = _PrimitivesCount;
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();

					// Setup properties
					AddProperty( Root, new SerializationSimpleValue( "owner", m_Owner ) );
					AddProperty( Root, new SerializationSimpleValue( "numberVertices", m_VerticesCount ) );
					AddProperty( Root, new SerializationSimpleValue( "numberPrimitives", m_PrimitivesCount ) );
					AddProperty( Root, new SerializationSimpleValue( "primitiveType", (int) m_Type ) );
					AddProperty( Root, new SerializationSimpleValue( "indexBuffer", m_IndexBuffer ) );
					AddProperty( Root, new SerializationSimpleValue( "startIndex", 0 ) );

					// Custom
					AddCustom( Root, new SerializationSimpleValue( "indexBuffer", m_IndexBuffer.UniqueID ) );

					// Params
					AddParam( Root, new SerializationParameter( "o3d.cull", false ) );
					AddParam( Root, new SerializationRawString( "o3d.boundingBox", "{ \"value\" : [] }" ) );	// Don't know the bounding-box format
//					AddParam( Root, new SerializationParameter( "o3d.boundingBox", new SerializationRawString( null, "[]" ) ) );
					AddParam( Root, new SerializationParameter( "o3d.priority", 0 ) );
					AddParam( Root, new SerializationParameter( "o3d.zSortPoint", new Vector() ) );
					AddParam( Root, new SerializationParameter( "o3d.streamBank", m_StreamBank ) );
					if ( m_Material != null )
						AddParam( Root, new SerializationParameter( "o3d.material", m_Material ) );

					return	Root;
				}

				#endregion
			}

			protected class	O3DStreamBank : O3DObject
			{
				#region NESTED TYPES

				protected enum SEMANTIC
				{
					UNKNOWN_SEMANTIC = 0,
					POSITION,
					NORMAL,
					TANGENT,
					BINORMAL,
					COLOR,
					TEXCOORD,
				}

				protected class		StreamInfos
				{
					public SEMANTIC			m_Semantic = 0;
					public int				m_Index = 0;
					public O3DVertexBuffer	m_AssociatedVertexBuffer = null;
				};

				#endregion

				#region FIELDS

				List<StreamInfos>			m_Infos = new List<StreamInfos>();
				Dictionary<SEMANTIC,int>	m_Semantic2Index = new Dictionary<SEMANTIC,int>();

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.STREAM_BANK; } }

				#endregion

				#region METHODS

				public O3DStreamBank( string _Name, int _UniqueID ) : base( null, _Name, _UniqueID )
				{
				}

				public void		AddStream( Mesh.Primitive.VertexStream _Stream, O3DVertexBuffer _AssociatedVertexBuffer )
				{
					// Build the stream info from the original stream
					StreamInfos	Infos = new StreamInfos();
					switch ( _Stream.StreamType )
					{
						case Mesh.VERTEX_INFO_TYPE.POSITION:
							Infos.m_Semantic = SEMANTIC.POSITION;
							break;
						case Mesh.VERTEX_INFO_TYPE.NORMAL:
							Infos.m_Semantic = SEMANTIC.NORMAL;
							break;
						case Mesh.VERTEX_INFO_TYPE.TANGENT:
							Infos.m_Semantic = SEMANTIC.TANGENT;
							break;
						case Mesh.VERTEX_INFO_TYPE.BINORMAL:
							Infos.m_Semantic = SEMANTIC.BINORMAL;
							break;
						case Mesh.VERTEX_INFO_TYPE.TEXCOORD1:
						case Mesh.VERTEX_INFO_TYPE.TEXCOORD2:
						case Mesh.VERTEX_INFO_TYPE.TEXCOORD3:
							Infos.m_Semantic = SEMANTIC.TEXCOORD;
							break;
						case Mesh.VERTEX_INFO_TYPE.COLOR_HDR:
							Infos.m_Semantic = SEMANTIC.TEXCOORD;
							break;
						case Mesh.VERTEX_INFO_TYPE.COLOR:
							Infos.m_Semantic = SEMANTIC.COLOR;
							break;

						default:
							Infos.m_Semantic = SEMANTIC.TEXCOORD;
							break;
					}

					if ( !m_Semantic2Index.ContainsKey( Infos.m_Semantic ) )
						m_Semantic2Index[Infos.m_Semantic] = 0;

					Infos.m_Index = m_Semantic2Index[Infos.m_Semantic]++;
					Infos.m_AssociatedVertexBuffer = _AssociatedVertexBuffer;

					m_Infos.Add( Infos );
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();

					SerializationArray	VertexStreamsArray = AddCustom( Root, new SerializationArray( "vertexStreams" ) ).AsArray;

					// Build each stream infos
					foreach ( StreamInfos Infos in m_Infos )
					{
						SerializationObject	StreamObject = VertexStreamsArray.AddItem( new SerializationObject( null ) ).AsObject.AddItem( new SerializationObject( "stream" ) ).AsObject;
						StreamObject.AddItem( new SerializationSimpleValue( "field", Infos.m_AssociatedVertexBuffer.FieldUniqueID ) );
						StreamObject.AddItem( new SerializationSimpleValue( "startIndex", 0 ) );
						StreamObject.AddItem( new SerializationSimpleValue( "semantic", (int) Infos.m_Semantic ) );
						StreamObject.AddItem( new SerializationSimpleValue( "semanticIndex", Infos.m_Index ) );
					}

					return	Root;
				}

				#endregion
			}

			protected class	O3DIndexBuffer : O3DObject, IBufferProvider
			{
				#region FIELDS

				protected int				m_FieldUniqueID = -1;
				protected O3DHelpers.Buffer	m_Buffer = null;

				protected int				m_BinaryRangeStart = -1;
				protected int				m_BinaryRangeEnd = -1;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.INDEX_BUFFER; } }

				#region IBufferProvider Members

				public O3DHelpers.IBuffer Buffer
				{
					get { return m_Buffer; }
				}

				public int BinaryRangeStart
				{
					get { return m_BinaryRangeStart; }
					set { m_BinaryRangeStart = value; }
				}

				public int BinaryRangeEnd
				{
					get { return m_BinaryRangeEnd; }
					set { m_BinaryRangeEnd = value; }
				}

				#endregion

				#endregion

				#region METHODS

				public O3DIndexBuffer( string _Name, int _UniqueID, int _FieldUniqueID, Mesh.Primitive _Primitive ) : base( null, _Name, _UniqueID )
				{
					m_FieldUniqueID = _FieldUniqueID;

					// Convert the primitive's faces into an O3D buffer
					m_Buffer = new O3DHelpers.Buffer();
					m_Buffer.Size = 3 * _Primitive.FacesCount;
					O3DHelpers.Buffer.FieldUInt32	IndexField = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_UINT32, 1 ) as O3DHelpers.Buffer.FieldUInt32;

					Mesh.ConsolidatedFace[]	Faces = _Primitive.Faces;
					for ( int FaceIndex=0 ; FaceIndex < Faces.Length; FaceIndex++ )
					{
						IndexField[3*FaceIndex+0].Set( (uint) Faces[FaceIndex].V0.m_Index );
						IndexField[3*FaceIndex+1].Set( (uint) Faces[FaceIndex].V1.m_Index );
						IndexField[3*FaceIndex+2].Set( (uint) Faces[FaceIndex].V2.m_Index );
					}
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();

					AddCustom( Root, new SerializationArray( "fields" ) ).AsArray.AddItem( new SerializationSimpleValue( null, m_FieldUniqueID ) );

					SerializationArray	BinaryRangeArray = AddCustom( Root, new SerializationArray( "binaryRange" ) ).AsArray;
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeStart ) );
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeEnd ) );

					return	Root;
				}

				#endregion
			}

			protected class	O3DVertexBuffer : O3DObject, IBufferProvider
			{
				#region FIELDS

				protected int				m_FieldUniqueID = -1;
				protected O3DHelpers.Buffer	m_Buffer = null;

				protected int				m_BinaryRangeStart = -1;
				protected int				m_BinaryRangeEnd = -1;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.VERTEX_BUFFER; } }

				public int	FieldUniqueID
				{
					get { return m_FieldUniqueID; }
				}

				#region IBufferProvider Members

				public O3DHelpers.IBuffer Buffer
				{
					get { return m_Buffer; }
				}

				public int BinaryRangeStart
				{
					get { return m_BinaryRangeStart; }
					set { m_BinaryRangeStart = value; }
				}

				public int BinaryRangeEnd
				{
					get { return m_BinaryRangeEnd; }
					set { m_BinaryRangeEnd = value; }
				}

				#endregion

				#endregion

				#region METHODS

				public O3DVertexBuffer( string _Name, int _UniqueID, int _FieldUniqueID, Mesh.Primitive.VertexStream _Stream ) : base( null, _Name, _UniqueID )
				{
					m_FieldUniqueID = _FieldUniqueID;

					// Convert the stream into an O3D buffer
					m_Buffer = new O3DHelpers.Buffer();
					m_Buffer.Size = _Stream.Stream.Length;

					switch ( _Stream.StreamType )
					{
						case Mesh.VERTEX_INFO_TYPE.POSITION:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_FLOAT32, 3 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								Point	Value = _Stream.Stream[i] as Point;
								Field[i].Set( Value.x, Value.y, Value.z );
							}
							break;
						}

						case Mesh.VERTEX_INFO_TYPE.NORMAL:
						case Mesh.VERTEX_INFO_TYPE.TANGENT:
						case Mesh.VERTEX_INFO_TYPE.BINORMAL:
						case Mesh.VERTEX_INFO_TYPE.TEXCOORD3:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_FLOAT32, 3 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								Vector	Value = _Stream.Stream[i] as Vector;
								Field[i].Set( Value.x, Value.y, Value.z );
							}
							break;
						}

						case Mesh.VERTEX_INFO_TYPE.TEXCOORD2:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_FLOAT32, 2 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								Vector2D	Value = _Stream.Stream[i] as Vector2D;
								Field[i].Set( Value.x, Value.y );
							}
							break;
						}

						case Mesh.VERTEX_INFO_TYPE.TEXCOORD1:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_FLOAT32, 1 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								float	Value = (float) _Stream.Stream[i];
								Field[i].Set( Value );
							}
							break;
						}

						case Mesh.VERTEX_INFO_TYPE.COLOR_HDR:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_FLOAT32, 4 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								Vector4D	Value = _Stream.Stream[i] as Vector4D;
								Field[i].Set( Value.x, Value.y, Value.z, Value.w );
							}
							break;
						}

						case Mesh.VERTEX_INFO_TYPE.COLOR:
						{
							O3DHelpers.Buffer.FieldFloat	Field = m_Buffer.AddField( O3DHelpers.Buffer.FieldID.FIELDID_UINT32, 1 ) as O3DHelpers.Buffer.FieldFloat;
							for ( int i=0; i < _Stream.Stream.Length; i++ )
							{
								Vector4D	Value = _Stream.Stream[i] as Vector4D;
								System.Drawing.Color	C = Helpers.CastToColorLDR( Value );
								Field[i].Set( (UInt32) C.ToArgb() );
							}
							break;
						}
					}
				}

				public override SerializationUnit BuildSerializationObject()
				{
					SerializationUnit	Root = base.BuildSerializationObject();

					AddCustom( Root, new SerializationArray( "fields" ) ).AsArray.AddItem( new SerializationSimpleValue( null, m_FieldUniqueID ) );

					SerializationArray	BinaryRangeArray = AddCustom( Root, new SerializationArray( "binaryRange" ) ).AsArray;
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeStart ) );
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeEnd ) );

					return	Root;
				}

				#endregion
			}

			#endregion

			#region Animation

			protected class	O3DParamObject : O3DObject
			{
				#region FIELDS

				protected int		m_OutputValueUniqueID = -1;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.PARAM_OBJECT; } }

				public int		OutputValueUniqueID
				{
					get { return m_OutputValueUniqueID; }
				}

				#endregion

				#region METHODS

				public O3DParamObject( string _Name, int _UniqueID, int _OutputValueUniqueID ) : base( null, _Name, _UniqueID )
				{
					m_OutputValueUniqueID = _OutputValueUniqueID;
				}

				#endregion
			};

			protected class	O3DAnimSource : O3DParamObject
			{
				#region METHODS

				public O3DAnimSource( string _Name, int _UniqueID, int _OutputValueUniqueID ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					AddParam( Root, new SerializationRawString( "animSource", "{\"class\":\"o3d.ParamFloat\",\"id\":" + m_OutputValueUniqueID + ",\"value\":0}" ) );

					return	Root;
				}

				#endregion
			};

			protected class	O3DFunctionEval : O3DParamObject
			{
				#region FIELDS

				protected O3DParamObject	m_TimeController = null;
				protected O3DCurveBuffer	m_EvaluatedCurve = null;
				protected string			m_BoundTransformName = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.FUNCTION_EVAL; } }

				#endregion

				#region METHODS

				/// <summary>
				/// 
				/// </summary>
				/// <param name="_Name"></param>
				/// <param name="_UniqueID"></param>
				/// <param name="_OutputValueUniqueID"></param>
				/// <param name="_TimeController"></param>
				/// <param name="_EvaluatedCurve"></param>
				/// <param name="_BoundTransformName">The name of the transform this evaluator will be bound to</param>
				public O3DFunctionEval( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DParamObject _TimeController, O3DCurveBuffer _EvaluatedCurve, string _BoundTransformName ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_TimeController = _TimeController;
					m_EvaluatedCurve = _EvaluatedCurve;
					m_BoundTransformName = _BoundTransformName;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					AddParam( Root, new SerializationParameter( "o3d.functionObject", m_EvaluatedCurve ) );
					BindInput( Root, "o3d.input", m_TimeController.OutputValueUniqueID );
					BindOutput( Root, "o3d.output", m_OutputValueUniqueID );

					// Add the name of the transform we are bound to
					// That helps on the runtime side to determine animation links so we can rebind the default animation time param to individual params
					if ( m_BoundTransformName != null )
						AddCustom( Root, new SerializationSimpleValue( "BoundTransform", m_BoundTransformName ) );

					return	Root;
				}

				#endregion
			};

			protected class	O3DParamOp3FloatsToFloat3 : O3DParamObject
			{
				#region FIELDS

				protected O3DFunctionEval	m_InputX = null;
				protected O3DFunctionEval	m_InputY = null;
				protected O3DFunctionEval	m_InputZ = null;
				protected Vector			m_DefaultValues = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.BUILD_VECTOR; } }

				#endregion

				#region METHODS

				public O3DParamOp3FloatsToFloat3( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DFunctionEval _InputX, O3DFunctionEval _InputY, O3DFunctionEval _InputZ, Vector _DefaultValues ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_InputX = _InputX;
					m_InputY = _InputY;
					m_InputZ = _InputZ;
					m_DefaultValues = _DefaultValues;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					if ( m_InputX != null )
						BindInput( Root, "o3d.input0", m_InputX.OutputValueUniqueID );
					else
						AddParam( Root, new SerializationParamObject( "o3d.input0", m_DefaultValues.x ) );

					if ( m_InputY != null )
						BindInput( Root, "o3d.input1", m_InputY.OutputValueUniqueID );
					else
						AddParam( Root, new SerializationParamObject( "o3d.input1", m_DefaultValues.y ) );

					if ( m_InputZ != null )
						BindInput( Root, "o3d.input2", m_InputZ.OutputValueUniqueID );
					else
						AddParam( Root, new SerializationParamObject( "o3d.input2", m_DefaultValues.z ) );

					BindOutput( Root, "o3d.output", m_OutputValueUniqueID );

					return	Root;
				}

				#endregion
			};

			protected class	O3DMatrix4Translation : O3DParamObject
			{
				#region FIELDS

				protected O3DParamOp3FloatsToFloat3	m_Translation = null;
				protected Matrix4x4					m_SourceMatrix = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.MATRIXOP_TRANSLATION; } }

				#endregion

				#region METHODS

				public O3DMatrix4Translation( string _Name, int _UniqueID, int _OutputValueUniqueID, Matrix4x4 _SourceMatrix, O3DParamOp3FloatsToFloat3 _Translation ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_SourceMatrix = _SourceMatrix;
					m_Translation = _Translation;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					AddParam( Root, new SerializationParamObject( "o3d.inputMatrix", m_SourceMatrix ) );
					BindOutput( Root, "o3d.outputMatrix", m_OutputValueUniqueID );
					BindInput( Root, "o3d.translation", m_Translation.OutputValueUniqueID );

					return	Root;
				}

				#endregion
			};

			protected class	O3DMatrix4Rotation : O3DParamObject
			{
				#region FIELDS

				protected O3DParamObject	m_InputMatrix = null;
				protected Vector			m_Axis = null;
				protected O3DFunctionEval	m_AngleEval = null;
				protected float				m_Angle = 0.0f;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.MATRIXOP_ROTATION; } }

				#endregion

				#region METHODS

				public O3DMatrix4Rotation( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DParamObject _InputMatrix, Vector _Axis, O3DFunctionEval _Angle ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_InputMatrix = _InputMatrix;
					m_Axis = _Axis;
					m_AngleEval = _Angle;
				}

				public O3DMatrix4Rotation( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DParamObject _InputMatrix, Vector _Axis, float _Angle ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_InputMatrix = _InputMatrix;
					m_Axis = _Axis;
					m_Angle = _Angle;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					BindInput( Root, "o3d.inputMatrix", m_InputMatrix.OutputValueUniqueID );
					BindOutput( Root, "o3d.outputMatrix", m_OutputValueUniqueID );
					AddParam( Root, new SerializationParameter( "o3d.axis", m_Axis ) );
					if ( m_AngleEval != null )
						BindInput( Root, "o3d.angle", m_AngleEval.OutputValueUniqueID );
					else
						AddParam( Root, new SerializationParameter( "o3d.angle", m_Angle ) );

					return	Root;
				}

				#endregion
			};

			protected class	O3DMatrix4Scale : O3DParamObject
			{
				#region FIELDS

				protected O3DParamObject			m_InputMatrix = null;
				protected O3DParamOp3FloatsToFloat3	m_Scale = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.MATRIXOP_SCALE; } }

				#endregion

				#region METHODS

				public O3DMatrix4Scale( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DParamObject _InputMatrix, O3DParamOp3FloatsToFloat3 _Scale ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_InputMatrix = _InputMatrix;
					m_Scale = _Scale;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					BindInput( Root, "o3d.inputMatrix", m_InputMatrix.OutputValueUniqueID );
					BindOutput( Root, "o3d.outputMatrix", m_OutputValueUniqueID );
					BindInput( Root, "o3d.scale", m_Scale.OutputValueUniqueID );

					return	Root;
				}

				#endregion
			};

			protected class	O3DMatrix4Composition : O3DParamObject
			{
				#region FIELDS

				protected O3DParamObject	m_InputMatrix = null;
				protected Matrix4x4			m_LocalMatrix = null;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.MATRIXOP_COMPOSITION; } }

				#endregion

				#region METHODS

				public O3DMatrix4Composition( string _Name, int _UniqueID, int _OutputValueUniqueID, O3DParamObject _InputMatrix, Matrix4x4 _LocalMatrix ) : base( _Name, _UniqueID, _OutputValueUniqueID )
				{
					m_InputMatrix = _InputMatrix;
					m_LocalMatrix = _LocalMatrix;
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					BindInput( Root, "o3d.inputMatrix", m_InputMatrix.OutputValueUniqueID );
					BindOutput( Root, "o3d.outputMatrix", m_OutputValueUniqueID );
					AddParam( Root, new SerializationParameter( "o3d.localMatrix", m_LocalMatrix ) );

					return	Root;
				}

				#endregion
			};

			protected class	O3DCurveBuffer : O3DObject, IBufferProvider
			{
				#region FIELDS

				protected O3DHelpers.CurveBuffer	m_Buffer = null;

				protected int				m_BinaryRangeStart = -1;
				protected int				m_BinaryRangeEnd = -1;

				#endregion

				#region PROPERTIES

				public override OBJECT_TYPES ObjectType		{ get { return OBJECT_TYPES.CURVE_BUFFER; } }

				#region IBufferProvider Members

				public O3DHelpers.IBuffer Buffer
				{
					get { return m_Buffer; }
				}

				public int BinaryRangeStart
				{
					get { return m_BinaryRangeStart; }
					set { m_BinaryRangeStart = value; }
				}

				public int BinaryRangeEnd
				{
					get { return m_BinaryRangeEnd; }
					set { m_BinaryRangeEnd = value; }
				}

				#endregion

				#endregion

				#region METHODS

				public O3DCurveBuffer( string _Name, int _UniqueID, FBXImporter.AnimationTrack _Track, float _KeyValueFactor ) : base( null, _Name, _UniqueID )
				{
					// Convert the animation track into an O3D curve
					m_Buffer = new O3DHelpers.CurveBuffer();

					if ( _Track.Keys.Length == 0 )
						return;	// No keys anyway...

					foreach ( FBXImporter.AnimationTrack.AnimationKey SourceKey in _Track.Keys )
					{
						// Determine key type
						O3DHelpers.CurveBuffer.KEY_TYPE	KeyType = O3DHelpers.CurveBuffer.KEY_TYPE.TYPE_UNKNOWN;
						switch ( SourceKey.Type )
						{
							case FBXImporter.AnimationTrack.AnimationKey.KEY_TYPE.CONSTANT:
								KeyType = O3DHelpers.CurveBuffer.KEY_TYPE.TYPE_STEP;
								break;

							case FBXImporter.AnimationTrack.AnimationKey.KEY_TYPE.LINEAR:
								KeyType = O3DHelpers.CurveBuffer.KEY_TYPE.TYPE_LINEAR;
								break;

							case FBXImporter.AnimationTrack.AnimationKey.KEY_TYPE.CUBIC:
								KeyType = O3DHelpers.CurveBuffer.KEY_TYPE.TYPE_BEZIER;
								break;
						}

						// Build the key
						O3DHelpers.CurveBuffer.Key			K = m_Buffer.AddKey( KeyType, SourceKey.Time, SourceKey.Value * _KeyValueFactor );

						// Add optional tangent data
						O3DHelpers.CurveBuffer.KeyBezier	KB = K as O3DHelpers.CurveBuffer.KeyBezier;
						if ( KB == null )
							continue;

						// NOTE: O3D awaits absolute coordinates in curve space for the in & out tangents
						// FBX provides weight and slope for in & out tangents
						// Weight is applied to the delta time between keys to yield the relative time position for the tangent
						// Slope is the delta-value to apply if moving 1 second along the time line
						// Slope * DeltaTime * Weight thus yields the relative value position for the tangent

						//////////////////////////////////////////////////////////////////////////
						// Determine left tangent based on previous & current key positions
						float	fPreviousKeyTime = K.Time;
						float	fPreviousKeyValue = K.Value;
						float	fPreviousKeyWeight = 0.0f;
						float	fPreviousKeySlope = 0.0f;
						if ( SourceKey.Previous != null )
						{
							fPreviousKeyTime = SourceKey.Previous.Time;
							fPreviousKeyValue = SourceKey.Previous.Value * _KeyValueFactor;
							fPreviousKeyWeight = SourceKey.Previous.NextLeftWeight;
							fPreviousKeySlope = SourceKey.Previous.NextLeftSlope;
						}

						float	fDeltaTime = SourceKey.Time - fPreviousKeyTime;
						KB.TangentIn = new Vector2D(	K.Time - fDeltaTime * fPreviousKeyWeight,
														K.Value - fDeltaTime * fPreviousKeyWeight * fPreviousKeySlope * _KeyValueFactor );

						//////////////////////////////////////////////////////////////////////////
						// Determine current slope based on current and next key's position
						float	fNextKeyTime = K.Time;
						float	fNextKeyValue = K.Value;
						if ( SourceKey.Next != null )
						{
							fNextKeyTime = SourceKey.Next.Time;
							fNextKeyValue = SourceKey.Next.Value * _KeyValueFactor;
						}

						fDeltaTime = fNextKeyTime - SourceKey.Time;
						KB.TangentOut = new Vector2D(	K.Time + fDeltaTime * SourceKey.RightWeight,
														K.Value + fDeltaTime * SourceKey.RightWeight * SourceKey.RightSlope * _KeyValueFactor );
					}
				}

				public override SerializationUnit  BuildSerializationObject()
				{
 					SerializationUnit	Root = base.BuildSerializationObject();

					AddProperty( Root, new SerializationSimpleValue( "preInfinity", 0 ) );
					AddProperty( Root, new SerializationSimpleValue( "postInfinity", 0 ) );
					AddProperty( Root, new SerializationSimpleValue( "useCache", true ) );
					AddProperty( Root, new SerializationSimpleValue( "sampleRate", 0.0333333f ) );	// 30 fps for now... Determine that from FBX

					SerializationArray	BinaryRangeArray = AddCustom( Root, new SerializationArray( "binaryRange" ) ).AsArray;
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeStart ) );
										BinaryRangeArray.AddItem( new SerializationSimpleValue( null, m_BinaryRangeEnd ) );

					return	Root;
				}

				#endregion
			};

			#endregion

			/// <summary>
			/// Class that helps to factorize identical Vertex Buffers
			/// </summary>
			class	MeshPrimitiveInfos
			{
				public class	VertexStreamInfo
				{
					public Mesh.Primitive.VertexStream	m_VertexStream = null;	// The original vertex stream
					public O3DVertexBuffer				m_VertexBuffer = null;	// The associated O3D vertex buffer
				};

				public int								m_FacesCount = 0;		// The number of faces in that master primitive
				public int								m_VerticesCount = 0;	// The number of vertices in that master primitive
				public O3DIndexBuffer					m_IndexBuffer = null;
				public Dictionary<FBXImporter.LayerElement,VertexStreamInfo>	m_LayerElement2VertexStreamInfo = new Dictionary<FBXImporter.LayerElement,VertexStreamInfo>();
			};

			#endregion

			#region FIELDS

			// The table mapping object types to object instances
			protected Dictionary<OBJECT_TYPES,List<O3DObject>>	m_Type2Objects = new Dictionary<OBJECT_TYPES,List<O3DObject>>();

			// The table mapping textures to their O3D samplers (used by materials to reference the appropriate samplers)
			protected Dictionary<Texture,O3DTextureSampler>		m_Texture2Sampler = new Dictionary<Texture,O3DTextureSampler>();

			// The table mapping texture file names (lowercase) to actual O3D textures (used to convert images only once)
			protected Dictionary<string,O3DTexture2D>			m_Name2Texture = new Dictionary<string,O3DTexture2D>();

			// The table mapping material names to the O3D materials
			protected Dictionary<string,O3DMaterial>			m_MaterialName2O3DMaterial = new Dictionary<string,O3DMaterial>();

			// The table mapping meshes to O3D shapes
			protected Dictionary<Mesh,O3DShape>					m_Mesh2Shape = new Dictionary<Mesh,O3DShape>();

			// The list of vertex, index & curve buffers
			protected List<O3DVertexBuffer>						m_VertexBuffers = new List<O3DVertexBuffer>();
			protected List<O3DIndexBuffer>						m_IndexBuffers = new List<O3DIndexBuffer>();
			protected List<O3DCurveBuffer>						m_CurveBuffers = new List<O3DCurveBuffer>();


			// The dummy textures when storing only delay-loaded textures
			protected O3DTexture2D								m_DummyTextureDiffuse = null;
			protected bool										m_bUseDummyTextureDiffuse = false;
			protected O3DTexture2D								m_DummyTextureNormal = null;
			protected bool										m_bUseDummyTextureNormal = false;
			protected O3DTexture2D								m_DummyTextureGeneric = null;
			protected bool										m_bUseDummyTextureGeneric = false;
			protected O3DTexture2D								m_DummyTextureCube = null;
			protected bool										m_bUseDummyTextureCube = false;


			//////////////////////////////////////////////////////////////////////////
			// Animation root controller
			protected O3DAnimSource		m_AnimationTimeController = null;
			//
			//////////////////////////////////////////////////////////////////////////
			

			// Unique ID generator
			protected int				m_UniqueIDCounter = 2;


			// Conversion warnings
			protected List<string>		m_ConversionWarnings = new List<string>();

			#endregion

			#region PROPERTIES

			/// <summary>
			/// Gets the list of warnings that occurred during conversion
			/// </summary>
			public string[]		Warnings
			{
				get { return m_ConversionWarnings.ToArray(); }
			}

			/// <summary>
			/// Tells if the scene contains curves
			/// </summary>
			public bool			HasCurves
			{
				get { return m_CurveBuffers.Count > 0; }
			}

			/// <summary>
			/// Tells if the scene contains skins
			/// </summary>
			public bool			HasSkins
			{
				get { return false; }
			}

			#endregion

			#region METHODS

			public		O3DScene( Serializer _Owner )
			{
				// Prepare the list of objects for each type
				Array	ObjectTypes = Enum.GetValues( typeof(OBJECT_TYPES) );
				foreach ( OBJECT_TYPES OT in ObjectTypes )
					m_Type2Objects[OT] = new List<O3DObject>();


				//////////////////////////////////////////////////////////////////////////
				// 0] Prepare dummy textures
				//
				m_DummyTextureDiffuse = new O3DTexture_Dummy( "DummyTextureDiffuse", GenerateUniqueID(), "DummyDiffuse.png", Properties.Resources.DummyDiffuse );
				m_DummyTextureNormal = new O3DTexture_Dummy( "DummyTextureNormal", GenerateUniqueID(), "DummyNormal.png", Properties.Resources.DummyNormal );
				m_DummyTextureGeneric = new O3DTexture_Dummy( "DummyTextureGeneric", GenerateUniqueID(), "DummyGeneric.png", Properties.Resources.DummyGeneric );
				m_DummyTextureCube = new O3DTexture_DummyCube( "DummyTextureCube", GenerateUniqueID(), "DummyCube.dds", Properties.Resources.DummyCube );


				//////////////////////////////////////////////////////////////////////////
				// 1] Convert textures
				foreach ( SceneObject Object in _Owner.m_SceneObjects )
				{
					Texture	T = Object as Texture;
					if ( T == null )
						continue;

					// Build the equivalent O3DTexture2D & O3DSampler
					O3DTexture2D	O3DT = null;
					try
					{
						O3DT = ConvertTexture( _Owner, T );
					}
					catch ( Exception _e )
					{
						AddWarning( "Texture \"" + T.Name + "\" could not be converted for the following reason :\r\n" + FormatException( _e, "\t    " ) );
					}

					if ( O3DT == null )
					{	// Skip the texture as it seems it's not referenced by anyone...
						AddWarning( "Texture \"" + T.Name + "\" was not serialized as it's not referenced by any existing material..." );
					}

					// Get the texture to reference
					O3DTexture2D	ReferencedTexture = O3DT;
					if ( O3DT is O3DTexture_DelayLoaded )
						ReferencedTexture = (O3DT as O3DTexture_DelayLoaded).DummyTexture;

					// Build the sampler that will reference that texture
					O3DTextureSampler	O3DS = new O3DTextureSampler( T.SamplerName, GenerateUniqueID(), T, ReferencedTexture );

					// Store the sampler
					AddO3DObject( O3DS );
					m_Texture2Sampler[T] = O3DS;

					// Add the referencing sampler to our O3D texture
					if ( O3DT != null )
						O3DT.AddReferencerSampler( O3DS );
				}

				if ( m_bUseDummyTextureDiffuse )
					AddO3DObject( m_DummyTextureDiffuse );
				if ( m_bUseDummyTextureNormal )
					AddO3DObject( m_DummyTextureNormal );
				if ( m_bUseDummyTextureGeneric )
					AddO3DObject( m_DummyTextureGeneric );
				if ( m_bUseDummyTextureCube )
					AddO3DObject( m_DummyTextureCube );

				//////////////////////////////////////////////////////////////////////////
				// 2] Convert materials
				foreach ( SceneObject Object in _Owner.m_SceneObjects )
				{
					Material	M = Object as Material;
					if ( M == null )
						continue;

					// Build the equivalent O3DMaterial
					O3DMaterial	O3DM = new O3DMaterial( M.Name, GenerateUniqueID(), M );
					m_MaterialName2O3DMaterial[M.Name] = O3DM;

					// Add all the texture samplers referenced by this material
					Texture[]	Textures = M.DiffuseTextures;
					foreach ( Texture T in Textures )
					{
						if ( !m_Texture2Sampler.ContainsKey( T ) )
							throw new Exception( "There is no existing sampler to match texture \"" + T.Name + "\" referenced by material \"" + M.Name + "\" !\r\nDid you forget to write the referenced textures in the script ?" );

						O3DM.AddTextureSampler( m_Texture2Sampler[T] );
					}

					Textures = M.NormalTextures;
					foreach ( Texture T in Textures )
					{
						if ( !m_Texture2Sampler.ContainsKey( T ) )
							throw new Exception( "There is no existing sampler to match texture \"" + T.Name + "\" referenced by material \"" + M.Name + "\" !\r\nDid you forget to write the referenced textures in the script ?" );

						O3DM.AddTextureSampler( m_Texture2Sampler[T] );
					}

					Textures = M.RegularTextures;
					foreach ( Texture T in Textures )
					{
						if ( !m_Texture2Sampler.ContainsKey( T ) )
							throw new Exception( "There is no existing sampler to match texture \"" + T.Name + "\" referenced by material \"" + M.Name + "\" !\r\nDid you forget to write the referenced textures in the script ?" );

						O3DM.AddTextureSampler( m_Texture2Sampler[T] );
					}

					// Store the material
					AddO3DObject( O3DM );
				}

				//////////////////////////////////////////////////////////////////////////
				// 3] Optimize & Convert meshes

				// 3.1] Optimize
				Mesh[]	Meshes = OptimizeMeshes( _Owner );

				// 3.2] Build vertex buffers for all unique vertex streams in the master meshes
				Dictionary<Mesh,List<MeshPrimitiveInfos>>	Mesh2PrimitiveInfos = new Dictionary<Mesh,List<MeshPrimitiveInfos>>();
				foreach ( Mesh M in Meshes )
					if ( M.IsMaster )
						foreach ( Mesh.Primitive P in M.ConsolidatedPrimitives )
						{
							string	MaterialName = P.Material != null ? P.Material.Name : (P.OverrideMaterial != null ? P.OverrideMaterial.Name : "Default");
							string	Name = M.Name + "|" + MaterialName;

							// Build the mesh primitive info for that particular primitive
							MeshPrimitiveInfos	Infos = new MeshPrimitiveInfos();
							if ( !Mesh2PrimitiveInfos.ContainsKey( M ) )
								Mesh2PrimitiveInfos[M] = new List<MeshPrimitiveInfos>();
							Mesh2PrimitiveInfos[M].Add( Infos );

							// Store primitive face & vertex infos
							Infos.m_FacesCount = P.FacesCount;
							Infos.m_VerticesCount = P.VerticesCount;

							// Build the index buffer for that primitive
							Infos.m_IndexBuffer = new O3DIndexBuffer( Name, GenerateUniqueID(), GenerateUniqueID(), P );
							m_IndexBuffers.Add( Infos.m_IndexBuffer );
							AddO3DObject( Infos.m_IndexBuffer );

							// Build vertex stream infos & the equivalent O3D vertex buffers
							Mesh.Primitive.VertexStream[]	Streams = P.VertexStreams;
							foreach ( Mesh.Primitive.VertexStream Stream in Streams )
							{
								MeshPrimitiveInfos.VertexStreamInfo	StreamInfos = new MeshPrimitiveInfos.VertexStreamInfo();
								Infos.m_LayerElement2VertexStreamInfo[Stream.SourceLayerElement] = StreamInfos;

								StreamInfos.m_VertexStream = Stream;

								// Build the equivalent vertex buffer
								string	StreamName = Name + "|" + Stream.StreamType.ToString();

								StreamInfos.m_VertexBuffer = new O3DVertexBuffer( StreamName, GenerateUniqueID(), GenerateUniqueID(), Stream );

								m_VertexBuffers.Add( StreamInfos.m_VertexBuffer );
								AddO3DObject( StreamInfos.m_VertexBuffer );
							}
						}

				// 3.3] Build the shapes, primitives & their stream banks
				foreach ( Mesh M in Meshes )
				{
					// Build the equivalent O3DShape
					O3DShape		O3DS = new O3DShape( M, M.Name, GenerateUniqueID() );
					m_Mesh2Shape[M] = O3DS;

					FBXImporter.LayerElement[]	LayerElements = M.LayerElements;
					List<MeshPrimitiveInfos>	Infos = Mesh2PrimitiveInfos[M.IsMaster ? M : M.MasterMesh];

					// Build the vertex streams for that mesh by concatenating every primitives
					Mesh.Primitive[]	Primitives = M.ConsolidatedPrimitives;
					for ( int PrimitiveIndex=0; PrimitiveIndex < Primitives.Length; PrimitiveIndex++ )
					{
						Mesh.Primitive		P = Primitives[PrimitiveIndex];
						MeshPrimitiveInfos	Info = Infos[PrimitiveIndex];

						string				MaterialName = P.Material != null ? P.Material.Name : (P.OverrideMaterial != null ? P.OverrideMaterial.Name : "Default");
						string				Name = M.Name + "|" + MaterialName;

						// Build the stream bank for that primitive
						O3DStreamBank		O3DSBank = new O3DStreamBank( Name, GenerateUniqueID() );

						// Retrieve the vertex buffers for that primitive
						foreach ( FBXImporter.LayerElement LE in LayerElements )
							if ( Info.m_LayerElement2VertexStreamInfo.ContainsKey( LE ) )
							{
								MeshPrimitiveInfos.VertexStreamInfo	StreamInfo = Info.m_LayerElement2VertexStreamInfo[LE];
								O3DSBank.AddStream( StreamInfo.m_VertexStream, StreamInfo.m_VertexBuffer );
							}

						// Build the equivalent O3DPrimitive
						O3DMaterial	Mat = null;
						if ( m_MaterialName2O3DMaterial.ContainsKey( MaterialName ) )
							Mat = m_MaterialName2O3DMaterial[MaterialName];

//						if ( !m_MaterialName2O3DMaterial.ContainsKey( MaterialName ) )
//							throw new Exception( "There is no registered material named \"" + MaterialName + "\" to be used by a primitive from object \"" + M.Name + "\" !" );

						O3DPrimitive	O3DP = new O3DPrimitive( Name, GenerateUniqueID(), O3DS, Mat, O3DSBank, Info.m_IndexBuffer, O3DPrimitive.PRIMITIVE_TYPE.TRIANGLELIST, Info.m_VerticesCount, Info.m_FacesCount );
						O3DS.AddPrimitive( O3DP );

						// Store the primitive and stream bank
						AddO3DObject( O3DP );
						AddO3DObject( O3DSBank );
					}

					// Store the shape
					AddO3DObject( O3DS );
				}


				//////////////////////////////////////////////////////////////////////////
				// 4] Convert transforms
				//
				Dictionary<SceneObject,O3DTransform>	FBX2O3DTransform = new Dictionary<SceneObject,O3DTransform>();
				Dictionary<O3DTransform,SceneObject>	O3D2FBXTransform = new Dictionary<O3DTransform,SceneObject>();

				foreach ( SceneObject Object in _Owner.m_SceneObjects )
				{
					Transform	T = Object as Transform;
					if ( T == null )
						continue;

					O3DTransform	O3DT = null;
					if ( T.IsAnimated )
					{	// Build a dynamic transform and its PRS animation chain
						int		ChainOutputID = BuildPRSAnimationChain( T, GetAnimationTimeController(), T.Name );
						O3DT = new O3DTransform( T, T.Name, GenerateUniqueID(), ChainOutputID );
					}
					else
					{	// Build a simple static transform
						O3DT = new O3DTransform( T, T.Name, GenerateUniqueID(), T.Matrix );
					}

					// For further parenting
					FBX2O3DTransform[T] = O3DT;
					O3D2FBXTransform[O3DT] = T;

					// Add the shapes
					foreach ( Mesh M in T.Meshes )
						O3DT.AddShape( m_Mesh2Shape[M] );

					AddO3DObject( O3DT );
				}

				// Perform parenting
				foreach ( O3DTransform O3DT in O3D2FBXTransform.Keys )
				{
					SceneObject	T = O3D2FBXTransform[O3DT];
					if ( T.Parent == null )
						continue;	// No parent for that transform...

					if ( !FBX2O3DTransform.ContainsKey( T.Parent ) )
						throw new Exception( "The transform \"" + T.Name + "\" references a parent transform \"" + T.Parent.Name + "\" that is not in the list of registered transforms!\r\n" +
											 "Are you sure you returned the Transform object when you converted your FBX node ? (a common mistake is to return the shape instead of the transform)" );

					O3DT.Parent = FBX2O3DTransform[T.Parent];
				}

				//////////////////////////////////////////////////////////////////////////
				// 5] Build binary ranges for buffers
				//
				int	BufferOffset = 0;
				foreach ( O3DVertexBuffer VB in m_VertexBuffers )
				{
					VB.BinaryRangeStart = BufferOffset;

					BufferOffset += VB.Buffer.Length;
					VB.BinaryRangeEnd = BufferOffset;
				}

				BufferOffset = 0;
				foreach ( O3DIndexBuffer IB in m_IndexBuffers )
				{
					IB.BinaryRangeStart = BufferOffset;

					BufferOffset += IB.Buffer.Length;
					IB.BinaryRangeEnd = BufferOffset;
				}

				BufferOffset = 0;
				foreach ( O3DCurveBuffer CB in m_CurveBuffers )
				{
					CB.BinaryRangeStart = BufferOffset;

					BufferOffset += CB.Buffer.Length;
					CB.BinaryRangeEnd = BufferOffset;
				}
			}

			/// <summary>
			/// Performs the serialization of the JSON scene file
			/// </summary>
			/// <param name="_Writer"></param>
			public void		SerializeJSON( TextWriter _Writer )
			{
				SerializationObject	Root = new SerializationObject( null );

				//////////////////////////////////////////////////////////////////////////
				// Add default parameters
				//
				Root.AddItem( new SerializationSimpleValue( "version", 5 ) );
				Root.AddItem( new SerializationSimpleValue( "o3d_rootObject_root", 1 ) );

				SerializationObject	ObjectsUnit = Root.AddItem( new SerializationObject( "objects" ) ).AsObject;

				//////////////////////////////////////////////////////////////////////////
				// Build serialization units for every objects of every type
				//
				OBJECT_TYPES[]	ObjectTypes = Enum.GetValues( typeof(OBJECT_TYPES) ) as OBJECT_TYPES[];
				for ( int ObjectTypeIndex=0; ObjectTypeIndex < ObjectTypes.Length; ObjectTypeIndex++ )
				{
					OBJECT_TYPES	ObjectType = (OBJECT_TYPES) ObjectTypes[ObjectTypeIndex];
					string			ObjectTypeName = O3D_TYPE_NAMES[ObjectTypeIndex];
					List<O3DObject>	Objects = m_Type2Objects[ObjectType];
					if ( Objects.Count == 0 )
						continue;

					// Build the root object containing all the objects of the current type
					SerializationArray	O3DTypeUnit = ObjectsUnit.AddItem( new SerializationArray( ObjectTypeName ) ).AsArray;

					// Add all the existing objects of that type
					foreach ( O3DObject Object in Objects )
						O3DTypeUnit.AddItem( Object.BuildSerializationObject() );
				}

				//////////////////////////////////////////////////////////////////////////
				// Perform actual serialization
				//
				Root.Serialize( _Writer );
			}

			/// <summary>
			/// Performs the serialization of the Vertex Buffers into a single file
			/// </summary>
			/// <param name="_OutputStream">The stream to write to</param>
			public void		SerializeVertexBuffers( Stream _OutputStream )
			{
				foreach ( O3DVertexBuffer VB in m_VertexBuffers )
					VB.Buffer.Save( _OutputStream );
			}

			/// <summary>
			/// Performs the serialization of the Index Buffers into a single file
			/// </summary>
			/// <param name="_OutputStream">The stream to write to</param>
			public void		SerializeIndexBuffers( Stream _OutputStream )
			{
				foreach ( O3DIndexBuffer IB in m_IndexBuffers )
					IB.Buffer.Save( _OutputStream );
			}

			/// <summary>
			/// Performs the serialization of the Index Buffers into a single file
			/// </summary>
			/// <param name="_OutputStream">The stream to write to</param>
			public void		SerializeCurveBuffers( Stream _OutputStream )
			{
				foreach ( O3DCurveBuffer CB in m_CurveBuffers )
					CB.Buffer.Save( _OutputStream );
			}

			/// <summary>
			/// Returns the list of file providers, each providing a group of files to embed or store some place
			/// </summary>
			/// <returns></returns>
			public IFilesProvider[]	GetFileProviders()
			{
				List<IFilesProvider>	Result = new List<IFilesProvider>();
				foreach ( List<O3DObject> Objects in m_Type2Objects.Values )
					foreach ( O3DObject O in Objects )
						if ( O is IFilesProvider )
							Result.Add( O as IFilesProvider );

				return	Result.ToArray();
			}

			#region Mesh Optimization

			/// <summary>
			/// Optimizes the existing meshes
			/// It will attempt to compact identical meshes and also consolidate mesh primitives
			/// </summary>
			protected Mesh[]	OptimizeMeshes( Serializer _Serializer )
			{
				// 1] Retrieve all existing meshes and compact identical instances
				List<Mesh>	Result = new List<Mesh>();
				foreach ( SceneObject Object in _Serializer.m_SceneObjects )
				{
					Mesh	M = Object as Mesh;
					if ( M == null )
						continue;

					// Check the existing meshes to see if they might be a master to this mesh
					if ( _Serializer.CompactIdenticalMeshes )
						foreach ( Mesh MasterMesh in Result )
							if ( M.MergeWithMasterMesh( MasterMesh ) )
								break;	// We found this mesh's master !

					Result.Add( M );
				}

				// 2] Consolidate master meshes
				WMath.Global.PushEpsilon( 1e-3f );	// Use this new epsilon for float comparisons in the Math library...

				foreach ( Mesh M in Result )
					M.PerformConsolidation();

				WMath.Global.PopEpsilon();

				return	Result.ToArray();
			}

			#endregion

			#region Helpers

			protected int	GenerateUniqueID()
			{
				return	m_UniqueIDCounter++;
			}

			protected void	AddO3DObject( O3DObject _Object )
			{
				m_Type2Objects[_Object.ObjectType].Add( _Object );
			}

			protected void	AddWarning( string _Warning )
			{
				m_ConversionWarnings.Add( _Warning );
			}

			/// <summary>
			/// Performs the conversion of a source texture into a target one, possibly of a different format
			/// </summary>
			/// <param name="_Serializer"></param>
			/// <param name="_Source">the source texture to convert</param>
			/// <returns>The converted texture or null if the texture is not referenced anywhere</returns>
			protected O3DTexture2D	ConvertTexture( Serializer _Serializer, Texture _Source )
			{
				// Check if the texture already exists
				string	TextureFileName = _Source.TextureFileName.ToLower();
				if ( m_Name2Texture.ContainsKey( TextureFileName ) )
					return	m_Name2Texture[TextureFileName];

				// Attempt to retrieve the conversion type needed for that texture
				// To do that, we have to browse every materials and see if the texture is marked as a diffuse, normal or generic texture
				bool						bFound = false;
				bool						bIsDiffuse = false;
				bool						bIsNormal = false;
				bool						bIsGeneric = false;
				TEXTURE_CONVERSION_TYPES	ConversionType = TEXTURE_CONVERSION_TYPES.NONE;

				foreach ( SceneObject Object in _Serializer.m_SceneObjects )
				{
					Material	M = Object as Material;
					if ( M == null )
						continue;

					// Look for diffuse textures
					Texture[]	Textures = M.DiffuseTextures;
					foreach ( Texture T in Textures )
						if ( T == _Source )
						{	// It's a diffuse texture
							ConversionType = _Serializer.ConvertDiffuse;
							bIsDiffuse = true;
							bFound = true;
							break;
						}

					if ( !bFound )
					{	// Look for normal textures
						Textures = M.NormalTextures;
						foreach ( Texture T in Textures )
							if ( T == _Source )
							{	// It's a normal texture
								ConversionType = _Serializer.ConvertNormal;
								bIsNormal = true;
								bFound = true;
								break;
							}

						if ( !bFound )
						{	// Look for generic textures
							Textures = M.RegularTextures;
							foreach ( Texture T in Textures )
								if ( T == _Source )
								{	// It's a generic texture
									ConversionType = _Serializer.ConvertRegular;
									bIsGeneric = true;
									bFound = true;
									break;
								}
						}
					}

					if ( bFound )
						break;		// Found the texture, no use to go any further...
				}

				if ( !bFound )
					return	null;	// This texture is not referenced by any material, we should skip it...

				// Create a new texture
				O3DTexture2D	Result = null;
				if ( _Source.Embed )
				{
					if ( _Source is TextureCube )
						Result = new O3DTextureCube( _Source, _Source.Name, GenerateUniqueID() );
					else
						Result = new O3DTexture2D( _Source, _Source.Name, GenerateUniqueID() );
				}
				else
				{
					O3DTexture2D	DummyTexture = null;
					if ( _Source is TextureCube )
					{
						DummyTexture = m_DummyTextureCube;
						m_bUseDummyTextureCube = true;
					}
					else
					{
						if ( bIsDiffuse )
						{
							DummyTexture = m_DummyTextureDiffuse;
							m_bUseDummyTextureDiffuse = true;
						}
						else if ( bIsNormal )
						{
							DummyTexture = m_DummyTextureNormal;
							m_bUseDummyTextureNormal = true;
						}
						else if ( bIsGeneric )
						{
							DummyTexture = m_DummyTextureGeneric;
							m_bUseDummyTextureGeneric = true;
						}
					}

					Result = new O3DTexture_DelayLoaded( _Source, _Source.Name, GenerateUniqueID(), DummyTexture );	// For delay-loaded textures, we don't care if it's a cube map or a 2D texture...
				}

				// Convert the texture
				try
				{
					Result.Convert( ConversionType, _Serializer.JPEGQuality );
				}
				catch ( Exception _e )
				{
					throw new Exception( "An exception occurred while converting texture \"" + _Source.Name + "\" !", _e );
				}

				// Add the new texture
				m_Name2Texture[TextureFileName] = Result;
				AddO3DObject( Result );

				return	Result;
			}

			#region Animation

			/// <summary>
			/// Gets the animation time controller (or creates it if it doesn't exist)
			/// </summary>
			/// <returns></returns>
			protected O3DParamObject	GetAnimationTimeController()
			{
				if ( m_AnimationTimeController != null )
					return	m_AnimationTimeController;

				// Create the unique controller
				m_AnimationTimeController = new O3DAnimSource( "o3d.animSourceOwner", GenerateUniqueID(), GenerateUniqueID() );
				AddO3DObject( m_AnimationTimeController );

				return	m_AnimationTimeController;
			}

			/// <summary>
			/// Builds all the O3D objects necessary to a PRS animation chain
			/// </summary>
			/// <param name="_Transform">The transform to build the animation chain for</param>
			/// <param name="_TimeController">The time controller for the animation</param>
			/// <param name="_TransformName">The name of the transform this chain will be bound to</param>
			/// <returns>The ID of the matrix that is the output of the animation chain (to be bound to a transform's local matrix for example)</returns>
			protected int		BuildPRSAnimationChain( Transform _Transform, O3DParamObject _TimeController, string _TransformName )
			{
				string		ChainName = _Transform.Name;
				Matrix4x4	DefaultTransform = _Transform.Matrix;								// The default transform to use if some tracks are missing
				FBXImporter.AnimationTrack[]	Positions = _Transform.AnimationTrackPositions;	// The Position animation tracks
				FBXImporter.AnimationTrack[]	Rotations = _Transform.AnimationTrackRotations;	// The Rotation animation tracks
				FBXImporter.AnimationTrack[]	Scales = _Transform.AnimationTrackScales;		// The Scale animation tracks
				Matrix4x4	SourceMatrix = _Transform.AnimationSourceMatrix;					// The matrix to use as source for the PRS animation (i.e. initial matrix that will get transformed by the animation)

				//////////////////////////////////////////////////////////////////////////
				// Build the PRS channels
				//

				// 1] Build the POSITION channels
				O3DFunctionEval[]	PositionEvaluators = new O3DFunctionEval[3];
				if ( Positions != null )
					for ( int TrackIndex=0; TrackIndex < Positions.Length; TrackIndex++ )
						PositionEvaluators[TrackIndex] = BuildAnimationChannel( ChainName, _TimeController, Positions[TrackIndex], 1.0f, _TransformName );

				// 2] Build the ROTATION channels
				O3DFunctionEval[]	RotationEvaluators = new O3DFunctionEval[3];
				if ( Rotations != null )
					for ( int TrackIndex=0; TrackIndex < Rotations.Length; TrackIndex++ )
						RotationEvaluators[TrackIndex] = BuildAnimationChannel( ChainName, _TimeController, Rotations[TrackIndex], 1.0f, _TransformName );

				// 3] Build the SCALE channels
				O3DFunctionEval[]	ScaleEvaluators = new O3DFunctionEval[3];
				if ( Scales != null )
					for ( int TrackIndex=0; TrackIndex < Scales.Length; TrackIndex++ )
						ScaleEvaluators[TrackIndex] = BuildAnimationChannel( ChainName, _TimeController, Scales[TrackIndex], 1.0f, _TransformName );


				//////////////////////////////////////////////////////////////////////////
				// Build the animation chain (Translation => RotationZ => RotationY => RotationX => Scale)
				//

				// 4] Build the TRANSLATION element
				Vector	DefaultTranslation = (Vector) (Point) DefaultTransform.GetTrans();
				O3DParamOp3FloatsToFloat3	O3DBV_Translation = new O3DParamOp3FloatsToFloat3( ChainName + ".T", GenerateUniqueID(), GenerateUniqueID(), PositionEvaluators[0], PositionEvaluators[1], PositionEvaluators[2], DefaultTranslation );
				AddO3DObject( O3DBV_Translation );
				O3DMatrix4Translation	O3DM4T = new O3DMatrix4Translation( ChainName + ".T", GenerateUniqueID(), GenerateUniqueID(), SourceMatrix, O3DBV_Translation );
				AddO3DObject( O3DM4T );

				O3DParamObject	LastMatrix = O3DM4T;

				// 5] Build the 3 ROTATION elements
				if ( RotationEvaluators[2] != null )
				{	// Z first
					O3DMatrix4Rotation	O3DM4R = new O3DMatrix4Rotation( ChainName + ".Rz", GenerateUniqueID(), GenerateUniqueID(), LastMatrix, new Vector( 0, 0, 1 ), RotationEvaluators[2] );
					AddO3DObject( O3DM4R );
					LastMatrix = O3DM4R;
				}

				if ( RotationEvaluators[1] != null )
				{	// Y then
					O3DMatrix4Rotation	O3DM4R = new O3DMatrix4Rotation( ChainName + ".Ry", GenerateUniqueID(), GenerateUniqueID(), LastMatrix, new Vector( 0, 1, 0 ), RotationEvaluators[1] );
					AddO3DObject( O3DM4R );
					LastMatrix = O3DM4R;
				}

				if ( RotationEvaluators[0] != null )
				{	// X last
					O3DMatrix4Rotation	O3DM4R = new O3DMatrix4Rotation( ChainName + ".Rx", GenerateUniqueID(), GenerateUniqueID(), LastMatrix, new Vector( 1, 0, 0 ), RotationEvaluators[0] );
					AddO3DObject( O3DM4R );
					LastMatrix = O3DM4R;
				}

				// 6] Build the SCALE element
				Vector	DefaultScale = DefaultTransform.GetScale();
				O3DParamOp3FloatsToFloat3	O3DBV_Scale = new O3DParamOp3FloatsToFloat3( ChainName + ".S", GenerateUniqueID(), GenerateUniqueID(), ScaleEvaluators[0], ScaleEvaluators[1], ScaleEvaluators[2], DefaultScale );
				AddO3DObject( O3DBV_Scale );
				O3DMatrix4Scale	O3DM4S = new O3DMatrix4Scale( ChainName + ".S", GenerateUniqueID(), GenerateUniqueID(), LastMatrix, O3DBV_Scale );
				AddO3DObject( O3DM4S );

				// The resulting scaled matrix is the final transform we can use as a local transform...
				return	O3DM4S.OutputValueUniqueID;
			}

			/// <summary>
			/// Builds a simple animation channel
			/// </summary>
			/// <param name="_TimeController"></param>
			/// <param name="_Track"></param>
			/// <param name="_TransformName">The name of the transform this channel will be bound to</param>
			/// <returns></returns>
			protected O3DFunctionEval	BuildAnimationChannel( string ChainName, O3DParamObject _TimeController, FBXImporter.AnimationTrack _Track, float _KeyValueFactor, string _TransformName )
			{
				string	ChannelName = Helpers.PrettyPrint ? (ChainName + "." + (_Track.ParentTrack != null ? (_Track.ParentTrack.Name + ".") : "") + _Track.Name) : "";

				// 1] Build the curve object
				O3DCurveBuffer	O3DC = new O3DCurveBuffer( ChannelName, GenerateUniqueID(), _Track, _KeyValueFactor );
				AddO3DObject( O3DC );

				m_CurveBuffers.Add( O3DC );

				// 2] Build the function evaluator that will evaluate the curve
				O3DFunctionEval	O3DFE = new O3DFunctionEval( ChannelName, GenerateUniqueID(), GenerateUniqueID(), _TimeController, O3DC, _TransformName );
				AddO3DObject( O3DFE );

				return	O3DFE;
			}

			#endregion

			protected string	FormatException( Exception _e, string _Prefix )
			{
				string	Result = "";
				while ( _e != null )
				{
					Result += _Prefix + ". " + _e.Message + "\r\n";
					_Prefix += "    ";
					_e = _e.InnerException;
				}

				return	Result;
			}

			#endregion

			#endregion
		};

		#endregion

		#region FIELDS

		// The list of generated scene objects
		protected List<SceneObject>			m_SceneObjects = new List<SceneObject>();

		// The list of texture files
		protected List<FileInfo>			m_Textures = new List<FileInfo>();


		// =================== Internal options ===================
		protected bool						m_bPrettyPrint = true;
		protected DirectoryInfo				m_SceneFilesOutputDirectory = null;

			// Meshes
		protected NO_TANGENT_SPACE_ACTION	m_NoTangentSpaceAction = NO_TANGENT_SPACE_ACTION.THROW;
		protected bool						m_bStoreHDRVertexColors = true;

		protected bool						m_bConsolidateSplitBySMG = true;
		protected bool						m_bConsolidateSplitByUV = true;
		protected bool						m_bConsolidateSplitByColor = true;

				// Compacting
		protected bool						m_bCompactIdenticalMeshes = true;
		protected int						m_MinUVsCount = 1;

			// Textures
		protected DirectoryInfo				m_TargetTexturesBaseDirectory = null;

		protected TEXTURE_CONVERSION_TYPES	m_ConvertDiffuse = TEXTURE_CONVERSION_TYPES.NONE;
		protected bool						m_bGenerateMipMapsDiffuse = true;

		protected TEXTURE_CONVERSION_TYPES	m_ConvertNormal = TEXTURE_CONVERSION_TYPES.NONE;
		protected bool						m_bGenerateMipMapsNormal = true;

		protected TEXTURE_CONVERSION_TYPES	m_ConvertRegular = TEXTURE_CONVERSION_TYPES.NONE;
		protected bool						m_bGenerateMipMapsRegular = true;

		protected int						m_JPEGQuality = 80;

		#endregion

		#region PROPERTIES

		public bool				PrettyPrint
		{
			get { return m_bPrettyPrint; }
			set
			{
				m_bPrettyPrint = value;

				// Setup the static flags
				O3DScene.SerializationUnit.PrettyPrint = value;
				Helpers.PrettyPrint = value;
			}
		}

		public NO_TANGENT_SPACE_ACTION	NoTangentSpaceAction
		{
			get { return m_NoTangentSpaceAction; }
			set { m_NoTangentSpaceAction = value; }
		}

		public bool				StoreHDRVertexColors
		{
			get { return m_bStoreHDRVertexColors; }
			set { m_bStoreHDRVertexColors = value; }
		}

		public bool				ConsolidateSplitBySMG
		{
			get { return m_bConsolidateSplitBySMG; }
			set { m_bConsolidateSplitBySMG = value; }
		}

		public bool				ConsolidateSplitByUV
		{
			get { return m_bConsolidateSplitByUV; }
			set { m_bConsolidateSplitByUV = value; }
		}

		public bool				ConsolidateSplitByColor
		{
			get { return m_bConsolidateSplitByColor; }
			set { m_bConsolidateSplitByColor = value; }
		}

		public bool				CompactIdenticalMeshes
		{
			get { return m_bCompactIdenticalMeshes; }
			set { m_bCompactIdenticalMeshes = value; }
		}

		/// <summary>
		/// Gets or sets the minimum amount of UV sets to keep
		/// </summary>
		public int				MinUVsCount
		{
			get { return m_MinUVsCount; }
			set { m_MinUVsCount = value; }
		}

		public DirectoryInfo	TargetTexturesBaseDirectory
		{
			get { return m_TargetTexturesBaseDirectory; }
			set { m_TargetTexturesBaseDirectory = value; }
		}

		public TEXTURE_CONVERSION_TYPES	ConvertDiffuse
		{
			get { return m_ConvertDiffuse; }
			set { m_ConvertDiffuse = value; }
		}
		public bool						GenerateMipMapsDiffuse
		{
			get { return m_bGenerateMipMapsDiffuse; }
			set { m_bGenerateMipMapsDiffuse = value; }
		}

		public TEXTURE_CONVERSION_TYPES	ConvertNormal
		{
			get { return m_ConvertNormal; }
			set { m_ConvertNormal = value; }
		}
		public bool						GenerateMipMapsNormal
		{
			get { return m_bGenerateMipMapsNormal; }
			set { m_bGenerateMipMapsNormal = value; }
		}

		public TEXTURE_CONVERSION_TYPES	ConvertRegular
		{
			get { return m_ConvertRegular; }
			set { m_ConvertRegular = value; }
		}
		public bool						GenerateMipMapsRegular
		{
			get { return m_bGenerateMipMapsRegular; }
			set { m_bGenerateMipMapsRegular = value; }
		}

		public int						JPEGQuality
		{
			get { return m_JPEGQuality; }
			set { m_JPEGQuality = value; }
		}

		#endregion

		#region METHODS

		public	Serializer()
		{
		}

		/// <summary>
		/// Begins serialization
		/// </summary>
		public void			Begin()
		{
			m_SceneObjects.Clear();
			m_Textures.Clear();
		}

		/// <summary>
		/// Creates a new scene object
		/// </summary>
		/// <param name="_ObjectType">The type of scene object to begin</param>
		/// <param name="_Name">The name of the object to create</param>
		/// <returns>The new scene object</returns>
		public SceneObject	CreateObject( SCENE_OBJECT_TYPES _ObjectType, string _Name )
		{
			switch ( _ObjectType )
			{
				case SCENE_OBJECT_TYPES.TRANSFORM:
					return new Transform( this, _Name );

				case SCENE_OBJECT_TYPES.MESH:
					return new Mesh( this, _Name );

				case SCENE_OBJECT_TYPES.MATERIAL:
					return new Material( this, _Name );

				case SCENE_OBJECT_TYPES.TEXTURE:
					return new Texture( this, _Name );

				case SCENE_OBJECT_TYPES.TEXTURE_CUBE:
					return new TextureCube( this, _Name );
			}

			throw new Exception( "Scene Object type \"" + _ObjectType + "\" is currently unsupported!" );
		}

		/// <summary>
		/// Validates the scene by allocating unique IDs, resolving references and notifying of errors
		/// </summary>
		/// <returns>A valid O3D scene or null if the scene failed</returns>
		/// <remarks>Call this method once the scene is complete</remarks>
		public O3DScene		ValidateScene()
		{
			return new O3DScene( this );
		}

		/// <summary>
		/// Commits a scene object to the list of objects
		/// </summary>
		/// <param name="_Object">The object to commit</param>
		protected void		Commit( SceneObject _Object )
		{
			m_SceneObjects.Add( _Object );
		}

		/// <summary>
		/// Discards a scene object
		/// </summary>
		/// <param name="_Object">The object to discard</param>
		protected void		Discard( SceneObject _Object )
		{
			// Simply don't do anything...
		}

		#endregion
	}
}
