using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace O3DHelpers
{
	/// <summary>
	/// Contains a buffer of continuous data used by index & vertex buffers
	/// To create a buffer, you must :
	///		_ Add fields of the type you need (Byte, UInt32 or Float) and of the requested amount of components
	///		_ Set the "Size" property of the buffer to the amount of elements
	/// 
	/// You then obtain a buffer looking like this:
	/// 
	/// Field0
	/// ------
	///  Element0 => | Component0 | Component1 | Component2 | ... (as many components as specified when adding Field0)
	///  Element1 => | Component0 | Component1 | Component2 | ...
	///  Element2 => | Component0 | Component1 | Component2 | ...
	///  Element3 => | Component0 | Component1 | Component2 | ...
	///  Element4 => | Component0 | Component1 | Component2 | ...
	///  Element5 => | Component0 | Component1 | Component2 | ...
	///  ... (as many elements as specified by "Size")
	/// 
	/// Field1
	/// ------
	///  Element0 => | Component0 | Component1 | Component2 | ... (as many components as specified when adding Field1)
	///  Element1 => | Component0 | Component1 | Component2 | ...
	///  Element2 => | Component0 | Component1 | Component2 | ...
	///  Element3 => | Component0 | Component1 | Component2 | ...
	///  Element4 => | Component0 | Component1 | Component2 | ...
	///  Element5 => | Component0 | Component1 | Component2 | ...
	///  ... (as many elements as specified by "Size")
	/// 
	/// </summary>
	public class Buffer : IBuffer
	{
		#region NESTED TYPES

		public enum FieldID
		{
			FIELDID_UNKNOWN = 0,
			FIELDID_FLOAT32 = 1,
			FIELDID_UINT32  = 2,
			FIELDID_BYTE    = 3
		};

		public abstract class	Field
		{
			#region NESTED TYPES

			public interface	IFieldElement
			{
				/// <summary>
				/// Sets the element's value
				/// </summary>
				/// <param name="_Value">The value to set</param>
				void	Set( params object[] _Value );
			}

			#endregion

			#region FIELDS

			protected int	m_ComponentsCount = 0;

			#endregion

			#region PROPERTIES

			/// <summary>
			/// Gets the amount of components for this field
			/// </summary>
			public int						ComponentsCount		{ get { return m_ComponentsCount; } }

			/// <summary>
			/// Gets or sets the size of the field
			/// </summary>
			public abstract int				Size				{ get; set; }

			/// <summary>
			/// Gets the field element at the specified index
			/// </summary>
			/// <param name="_Index">The index of the element</param>
			/// <returns>An interface to the element</returns>
			public abstract IFieldElement	this[int _Index]	{ get; }

			#endregion

			#region METHODS

			public	Field( int _ComponentsCount )
			{
				m_ComponentsCount = _ComponentsCount;
			}

			/// <summary>
			/// Saves the field to a binary writer
			/// </summary>
			/// <param name="_Writer">The writer to write the stream to</param>
			public abstract void	Save( BinaryWriter _Writer );

			#endregion
		};

		public class	FieldFloat : Field
		{
			#region NESTED TYPES

			public class	Element : IFieldElement
			{
				protected float[]	m_Element = null;

				public Element( float[] _Element )
				{
					m_Element = _Element;
				}

				#region IFieldElement Members

				public void Set( params object[] _Value )
				{
					if ( _Value.Length != m_Element.Length )
						throw new Exception( "Expecting " + m_Element.Length + " values for element !" );

					for ( int i=0; i < m_Element.Length; i++ )
						m_Element[i] = (float) _Value[i];
				}

				#endregion
			};

			#endregion

			#region FIELDS

			protected float[][]		m_Elements = null;

			#endregion

			#region PROPERTIES

			public override int		Size
			{
				get { return m_Elements.GetLength( 0 ); }
				set
				{
					m_Elements = new float[value][];
					for ( int ElementIndex=0; ElementIndex < value; ElementIndex++ )
						m_Elements[ElementIndex] = new float[m_ComponentsCount];
				}
			}

			public override IFieldElement	this[int _Index]
			{
				get { return new Element( m_Elements[_Index] ); }
			}

			#endregion

			#region METHODS

			public	FieldFloat( int _ComponentsCount ) : base( _ComponentsCount )
			{
			}

			public override void	Save( BinaryWriter _Writer )
			{
				foreach ( float[] Element in m_Elements )
					for ( int ComponentIndex=0; ComponentIndex < m_ComponentsCount; ComponentIndex++ )
						_Writer.Write( Element[ComponentIndex] );
			}

			#endregion
		};

		public class	FieldUInt32 : Field
		{
			#region NESTED TYPES

			public class	Element : IFieldElement
			{
				protected uint[]	m_Element = null;

				public Element( uint[] _Element )
				{
					m_Element = _Element;
				}

				#region IFieldElement Members

				public void Set( params object[] _Value )
				{
					if ( _Value.Length != m_Element.Length )
						throw new Exception( "Expecting " + m_Element.Length + " values for element !" );

					for ( int i=0; i < m_Element.Length; i++ )
						m_Element[i] = (uint) _Value[i];
				}

				#endregion
			};

			#endregion

			#region FIELDS

			protected uint[][]		m_Elements = null;

			#endregion

			#region PROPERTIES

			public override int		Size
			{
				get { return m_Elements.GetLength( 0 ); }
				set
				{
					m_Elements = new uint[value][];
					for ( int ElementIndex=0; ElementIndex < value; ElementIndex++ )
						m_Elements[ElementIndex] = new uint[m_ComponentsCount];
				}
			}

			public override IFieldElement	this[int _Index]
			{
				get { return new Element( m_Elements[_Index] ); }
			}

			#endregion

			#region METHODS

			public	FieldUInt32( int _ComponentsCount ) : base( _ComponentsCount )
			{
			}

			public override void	Save( BinaryWriter _Writer )
			{
				foreach ( uint[] Element in m_Elements )
					for ( int ComponentIndex=0; ComponentIndex < m_ComponentsCount; ComponentIndex++ )
						_Writer.Write( Element[ComponentIndex] );
			}

			#endregion
		};

		public class	FieldByte : Field
		{
			#region NESTED TYPES

			public class	Element : IFieldElement
			{
				protected byte[]	m_Element = null;

				public Element( byte[] _Element )
				{
					m_Element = _Element;
				}

				#region IFieldElement Members

				public void Set( params object[] _Value )
				{
					if ( _Value.Length != m_Element.Length )
						throw new Exception( "Expecting " + m_Element.Length + " values for element !" );

					for ( int i=0; i < m_Element.Length; i++ )
						m_Element[i] = (byte) _Value[i];
				}

				#endregion
			};

			#endregion

			#region FIELDS

			protected byte[][]		m_Elements = null;

			#endregion

			#region PROPERTIES

			public override int		Size
			{
				get { return m_Elements.GetLength( 0 ); }
				set
				{
					m_Elements = new byte[value][];
					for ( int ElementIndex=0; ElementIndex < value; ElementIndex++ )
						m_Elements[ElementIndex] = new byte[m_ComponentsCount];
				}
			}

			public override IFieldElement	this[int _Index]
			{
				get { return new Element( m_Elements[_Index] ); }
			}

			#endregion

			#region METHODS

			public	FieldByte( int _ComponentsCount ) : base( _ComponentsCount )
			{
			}

			public override void	Save( BinaryWriter _Writer )
			{
				foreach ( byte[] Element in m_Elements )
					for ( int ComponentIndex=0; ComponentIndex < m_ComponentsCount; ComponentIndex++ )
						_Writer.Write( Element[ComponentIndex] );
			}

			#endregion
		};

		#endregion

		#region FIELDS

		protected int			m_Size = 0;
		protected List<Field>	m_Fields = new List<Field>();

		#endregion

		#region PROPERTIES

		/// <summary>
		/// Gets or sets the size of the buffer
		/// </summary>
		public int	Size
		{
			get { return m_Size; }
			set
			{
				m_Size = value;
				foreach ( Field F in m_Fields )
					F.Size = value;
			}
		}

		/// <summary>
		/// Gets the existing fields in that buffer
		/// </summary>
		public Field[]	Fields
		{
			get { return m_Fields.ToArray(); }
		}

		/// <summary>
		/// Gets the buffer length
		/// </summary>
		public int		Length
		{
			get
			{
				int	Result = 4;					// Header
					Result += sizeof(int);		// Version
					Result += sizeof(int);		// Fields count

				foreach ( Field F in m_Fields )
					Result += 2 * sizeof(byte);	// Field infos

					Result += sizeof(int);		// Size

				foreach ( Field F in m_Fields )
				{
					int	FieldSize = 0;
					if ( F is FieldByte )
						FieldSize = sizeof(byte);
					else if ( F is FieldFloat )
						FieldSize = sizeof(float);
					else if ( F is FieldUInt32 )
						FieldSize = sizeof(UInt32);

					Result += FieldSize * F.Size * F.ComponentsCount;
				}

				return	Result;
			}
		}

		#endregion

		#region METHODS

		public	Buffer()
		{
		}

		/// <summary>
		/// Creates and adds a new field to the buffer
		/// </summary>
		/// <param name="_FieldType">The type of field to create</param>
		/// <param name="_ComponentsCount">The amount of components in the field</param>
		/// <returns>The newly created field</returns>
		public Field	AddField( FieldID _FieldType, int _ComponentsCount )
		{
			Field	Result = null;
			switch ( _FieldType )
			{
				case FieldID.FIELDID_FLOAT32:
					Result = new FieldFloat( _ComponentsCount );
					break;
				case FieldID.FIELDID_UINT32:
					Result = new FieldUInt32( _ComponentsCount );
					break;
				case FieldID.FIELDID_BYTE:
					Result = new FieldByte( _ComponentsCount );
					break;
				default:
					throw new Exception( "Invalid field type!" );
			}

			Result.Size = m_Size;
			m_Fields.Add( Result );

			return	Result;
		}

		/// <summary>
		/// Saves the buffer as a binary object directly readable by O3D
		/// </summary>
		/// <param name="_OutputStream">The stream where to write the binary object</param>
		public void		Save( Stream _OutputStream )
		{
			BinaryWriter	Writer = new BinaryWriter( _OutputStream );

			// Write the header and version
			Writer.Write( new char[] { 'B', 'U', 'F', 'F' } );
			Writer.Write( (int) 1 );		// Version 1 is latest

			// Write the amount of fields
			Writer.Write( (int) m_Fields.Count );

			// Write field infos
			foreach ( Field F in m_Fields )
			{
				// Write field type
				FieldID	FieldType = FieldID.FIELDID_UNKNOWN;
				if ( F is FieldFloat )
					FieldType = FieldID.FIELDID_FLOAT32;
				else if ( F is FieldUInt32 )
					FieldType = FieldID.FIELDID_UINT32;
				else if ( F is FieldByte )
					FieldType = FieldID.FIELDID_BYTE;

				Writer.Write( (byte) FieldType );

				// And components count
				Writer.Write( (byte) F.ComponentsCount );
			}

			// Write buffer size
			Writer.Write( (int) m_Size );

			// Write each field's data
			foreach ( Field F in m_Fields )
				F.Save( Writer );

			// Finalize
			Writer.Flush();
		}

		#endregion
	}
}
