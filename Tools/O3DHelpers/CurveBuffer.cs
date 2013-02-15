using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace O3DHelpers
{
	/// <summary>
	/// Contains a buffer storing curve data
	/// </summary>
	public class CurveBuffer : IBuffer
	{
		#region NESTED TYPES

		public enum	KEY_TYPE
		{
			TYPE_UNKNOWN = 0,
			TYPE_STEP = 1,
			TYPE_LINEAR = 2,
			TYPE_BEZIER = 3,
		};

		/// <summary>
		/// Base key class, valid for STEP & LINEAR keys
		/// </summary>
		[System.Diagnostics.DebuggerDisplay( "Time={Time} Value={Value}" )]
		public class	Key
		{
			#region FIELDS

			protected KEY_TYPE	m_Type = KEY_TYPE.TYPE_UNKNOWN;
			protected float		m_Time = 0.0f;
			protected float		m_Value = 0.0f;

			#endregion

			#region PROPERTIES

			public virtual int		Length
			{
				get { return sizeof(byte) + 2 * sizeof(float); }
			}

			public float			Time
			{
				get { return m_Time; }
				set { m_Time = value; }
			}

			public float			Value
			{
				get { return m_Value; }
				set { m_Value = value; }
			}

			#endregion

			#region METHODS

			public	Key( KEY_TYPE _Type, float _Time, float _Value )
			{
				m_Type = _Type;
				m_Time = _Time;
				m_Value = _Value;
			}

			/// <summary>
			/// Saves the key to a binary writer
			/// </summary>
			/// <param name="_Writer">The writer to write the stream to</param>
			public virtual void	Save( BinaryWriter _Writer )
			{
				_Writer.Write( (byte) m_Type );
				_Writer.Write( m_Time );
				_Writer.Write( m_Value );
			}

			#endregion
		};

		[System.Diagnostics.DebuggerDisplay( "Time={Time} Value={Value} TgtIn={TangentIn} TgtOut={TangentOut}" )]
		public class	KeyBezier : Key
		{
			#region FIELDS

			protected WMath.Vector2D	m_TangentIn = new WMath.Vector2D();
			protected WMath.Vector2D	m_TangentOut = new WMath.Vector2D();

			#endregion

			#region PROPERTIES

			public override int		Length
			{
				get { return base.Length + 2 * 2 * sizeof(float); }
			}

			public WMath.Vector2D	TangentIn
			{
				get { return m_TangentIn; }
				set { m_TangentIn = value; }
			}

			public WMath.Vector2D	TangentOut
			{
				get { return m_TangentOut; }
				set { m_TangentOut = value; }
			}

			#endregion

			#region METHODS

			public	KeyBezier( KEY_TYPE _Type, float _Time, float _Value ) : base( _Type, _Time, _Value )
			{
			}

			/// <summary>
			/// Saves the key to a binary writer
			/// </summary>
			/// <param name="_Writer">The writer to write the stream to</param>
			public override void	Save( BinaryWriter _Writer )
			{
				base.Save( _Writer );

				// Write the tangents
				_Writer.Write( m_TangentIn.x );
				_Writer.Write( m_TangentIn.y );
				_Writer.Write( m_TangentOut.x );
				_Writer.Write( m_TangentOut.y );
			}

			#endregion
		};

		#endregion

		#region FIELDS

		protected List<Key>	m_Keys = new List<Key>();

		#endregion

		#region PROPERTIES

		public Key[]	Keys
		{
			get { return m_Keys.ToArray(); }
		}

		#region IBuffer Members

		/// <summary>
		/// Gets the buffer length
		/// </summary>
		public int		Length
		{
			get
			{
				int	Result = 4;					// Header
					Result += sizeof(int);		// Version

				foreach ( Key K in m_Keys )
					Result += K.Length;

				return	Result;
			}
		}

		#endregion

		#endregion

		#region METHODS

		public	CurveBuffer()
		{
		}

		/// <summary>
		/// Creates and adds a new field to the buffer
		/// </summary>
		/// <param name="_KeyType">The type of key to create</param>
		/// <param name="_Time">The input value</param>
		/// <param name="_Value">The output value</param>
		public Key	AddKey( KEY_TYPE _KeyType, float _Time, float _Value )
		{
			Key	Result = null;
			switch ( _KeyType )
			{
				case KEY_TYPE.TYPE_STEP:
					Result = new Key( KEY_TYPE.TYPE_STEP, _Time, _Value );
					break;

				case KEY_TYPE.TYPE_LINEAR:
					Result = new Key( KEY_TYPE.TYPE_LINEAR, _Time, _Value );
					break;

				case KEY_TYPE.TYPE_BEZIER:
					Result = new KeyBezier( KEY_TYPE.TYPE_BEZIER, _Time, _Value );
					break;

				default:
					throw new Exception( "Invalid key type!" );
			}

			m_Keys.Add( Result );

			return	Result;
		}

		#region IBuffer Members

		/// <summary>
		/// Saves the buffer as a binary object directly readable by O3D
		/// </summary>
		/// <param name="_OutputStream">The stream where to write the binary object</param>
		public void		Save( Stream _OutputStream )
		{
			BinaryWriter	Writer = new BinaryWriter( _OutputStream );

			// Write the header and version
			Writer.Write( new char[] { 'C', 'U', 'R', 'V' } );
			Writer.Write( (int) 1 );		// Version 1 is latest

			// Write key infos
			foreach ( Key K in m_Keys )
				K.Save( Writer );

			// Finalize
			Writer.Flush();
		}

		#endregion

		/// <summary>
		/// Used for debug purpose
		/// </summary>
		/// <param name="_InputStream"></param>
		public void		Load( Stream _InputStream )
		{
			BinaryReader	Reader = new BinaryReader( _InputStream );
			char[]			Header = Reader.ReadChars( 4 );
			int				Version = Reader.ReadInt32();

			while ( _InputStream.Position < _InputStream.Length )
			{
				KEY_TYPE	KeyType = (KEY_TYPE) Reader.ReadByte();
				KeyBezier	KB = AddKey( KeyType, Reader.ReadSingle(), Reader.ReadSingle() ) as KeyBezier;
				if ( KB != null )
				{
					KB.TangentIn = new WMath.Vector2D( Reader.ReadSingle(), Reader.ReadSingle() );
					KB.TangentOut = new WMath.Vector2D( Reader.ReadSingle(), Reader.ReadSingle() );
				}
			}
		}

		#endregion
	}
}
