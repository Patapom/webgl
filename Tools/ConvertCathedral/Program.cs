using System;
using System.Collections.Generic;
using System.IO;

namespace Convert
{
	static class Program
	{
		public class	Primitive
		{
			public class	VertexStream
			{
				public enum PACK_TYPE
				{
					NONE,
					REDUCE_UV,	// (FLOAT3) Saves only as FLOAT2 since W is 0
					RGBE,		// (FLOAT3) RGBE encoding
					FLOAT_AMP,	// (FLOAT4) 1 float (i.e. maximum amplitude) + 4 bytes encoding [-1,+1] values later multiplied by amplitude
					NORM_U8,	// (FLOAT4) 4 U8 that encode normalized [-1,+1] data
				}

				public string	Name = null;
				public int		Offset = -1;

				public VertexStream( BinaryWriter _Writer, object _Buffer, BUFFER_TYPE _Type, int _Semantic, int _Index )
				{
					// Decode StreamBank semantics
					// POSITION, NORMAL,TANGENT, BINORMAL,COLOR, TEXCOORD
					PACK_TYPE Pack = PACK_TYPE.NONE;
					switch ( _Semantic )
					{
						case 1:
							if ( _Index != 0 ) throw new Exception( "Unexpected index !" );
							if ( _Type != BUFFER_TYPE.FLOAT3 ) throw new Exception( "Unexpected type !" );
							Name = "_P";	// Position
							break;
						case 2:
							if ( _Index != 0 ) throw new Exception( "Unexpected index !" );
							if ( _Type != BUFFER_TYPE.FLOAT3 ) throw new Exception( "Unexpected type !" );
							Name = "_N";	// Normal
							break;
						case 3:
							if ( _Index != 0 ) throw new Exception( "Unexpected index !" );
							if ( _Type != BUFFER_TYPE.FLOAT3 ) throw new Exception( "Unexpected type !" );
							Name = "_T";	// Tangent
							break;
						case 4:
							return;	// Assume bitangent is reconstructed in the shader
// 							if ( _Index != 0 ) throw new Exception( "Unexpected index !" );
// 							if ( _Type != BUFFER_TYPE.FLOAT3 ) throw new Exception( "Unexpected type !" );
// 							Name = "_B";	// Bitangent
// 							break;

						case 6:
							switch ( _Index )
							{
							case 0: Name = "_UV"; if ( _Type != BUFFER_TYPE.FLOAT2 ) throw new Exception( "Unexpected type !" ); break;
							case 1: Name = "_SH0"; Pack = PACK_TYPE.NORM_U8; if ( _Type != BUFFER_TYPE.FLOAT4 ) throw new Exception( "Unexpected type !" ); break;
							case 2: Name = "_SH1"; Pack = PACK_TYPE.NORM_U8; if ( _Type != BUFFER_TYPE.FLOAT4 ) throw new Exception( "Unexpected type !" ); break;
							case 3: Name = "_SH2"; Pack = PACK_TYPE.NORM_U8; if ( _Type != BUFFER_TYPE.FLOAT4 ) throw new Exception( "Unexpected type !" ); break;
							}
							break;
					}
					if ( Name == null )
						throw new Exception( "Failed to recognize semantic !" );

					// Write the buffer into the blob
					Offset = (int) _Writer.BaseStream.Position;

					switch ( _Type )
					{
						case BUFFER_TYPE.FLOAT2:
							{
								float2[]	Buffer = _Buffer as float2[];
								_Writer.Write( (int) 6 );					// Float32Array
								_Writer.Write( 2 * (int) Buffer.Length );	// Write size
								for ( int i=0; i < Buffer.Length; i++ )
								{
									_Writer.Write( Buffer[i].x );
									_Writer.Write( Buffer[i].y );
								}
								break;
							}

						case BUFFER_TYPE.FLOAT3:
							{
								float3[]	Buffer = _Buffer as float3[];
								_Writer.Write( (int) 6 );					// Float32Array
								if ( Pack == PACK_TYPE.REDUCE_UV )
								{
									_Writer.Write( 2 * (int) Buffer.Length );	// Write size
									for ( int i=0; i < Buffer.Length; i++ )
									{
										_Writer.Write( Buffer[i].x );
										_Writer.Write( Buffer[i].y );
										// Skip W
									}
								}
								else
								{
									_Writer.Write( 3 * (int) Buffer.Length );	// Write size
									for ( int i=0; i < Buffer.Length; i++ )
									{
										_Writer.Write( Buffer[i].x );
										_Writer.Write( Buffer[i].y );
										_Writer.Write( Buffer[i].z );
									}
								}
								break;
							}

						case BUFFER_TYPE.FLOAT4:
							{
								float4[]	Buffer = _Buffer as float4[];
								_Writer.Write( (int) 6 );					// Float32Array
								_Writer.Write( 4 * (int) Buffer.Length );	// Write size
								for ( int i=0; i < Buffer.Length; i++ )
								{
									_Writer.Write( Buffer[i].x );
									_Writer.Write( Buffer[i].y );
									_Writer.Write( Buffer[i].z );
									_Writer.Write( Buffer[i].w );
								}
								break;
							}
					}

				}

				public void	AppendDescriptor( StreamWriter _Writer )
				{
					_Writer.Write( "		{ Name : \"" + Name + "\", Offset : " + Offset + " },\n" );
				}
			}

			public int					m_IBOffset;
			public List<VertexStream>	m_Streams = new List<VertexStream>();
			public MemoryStream			m_Blob = new MemoryStream();
			public BinaryWriter			m_Writer = null;

			public Primitive()
			{
				m_Writer = new BinaryWriter( m_Blob );
			}

			public void	Dispose()
			{
				m_Writer.Dispose();
				m_Blob.Dispose();
			}

			public void	Save( FileInfo _FileName )
			{
				m_Writer.Flush();	// Finish writing...

				byte[]	BlobBuffer = m_Blob.GetBuffer();
				using ( FileStream Stream = _FileName.Create() )
					Stream.Write( BlobBuffer, 0, (int) m_Blob.Length );
			}

			// Adds a descriptor for that primitive as a JS object
			public void	AppendDescriptor( StreamWriter _Writer )
			{
				_Writer.Write( "	{ IndexOffset : " + m_IBOffset + ", VertexStreams : [\n" );
				foreach ( VertexStream S in m_Streams )
					S.AppendDescriptor( _Writer );
				_Writer.Write( "	] },\n" );
			}

			public void	DecodeIndexBuffer( byte[] _Buffer, IndexBuffer.IB _IB )
			{
				if ( _IB.Vertices > 65536 )
					throw new Exception( "Handle INT32 indices !" );

				// Read the buffer content
				BUFFER_TYPE	Type;
				object	ContentObj = DecodeBuffer( _Buffer, out Type );
				if ( Type != BUFFER_TYPE.U32 )
					throw new Exception( "Expected U32 buffer type !" );

				int[]	Content = (int[]) ContentObj;
				if ( Content.Length != 3*_IB.Primitives )
					throw new Exception( "Expected 3 times the amount of primitives as number of elements in the buffer !" );

				// Rebuild our new buffer type
				m_IBOffset = (int) m_Blob.Position;

				m_Writer.Write( (int) 3 );				// UInt16Array
				m_Writer.Write( (int) Content.Length );	// Write size
				for ( int i=0; i < Content.Length; i++ )
					m_Writer.Write( (ushort) Content[i] );
			}
	
			public void	DecodeVertexBuffer( BinaryReader _Reader, VertexBuffer.VB _VB )
			{
				foreach ( VertexBuffer.VertexStream Stream in _VB.Streams )
				{
					_Reader.BaseStream.Position = Stream.Start;	// Start at appropriate position

					int		VBSize = Stream.End - Stream.Start;
					byte[]	Temp = new byte[VBSize];
					_Reader.Read( Temp, 0, VBSize );

					// Read the buffer content
					BUFFER_TYPE	Type;
					object	ContentObj = DecodeBuffer( Temp, out Type );

					VertexStream	VS = new VertexStream( m_Writer, ContentObj, Type, Stream.Semantic, Stream.Index );
					if ( VS.Name == null )
						continue;	// Invalid stream

					m_Streams.Add( VS );
				}
			}


			public struct	float2
			{
				public float x, y;
				public void		Read( BinaryReader _Reader )	{ x = _Reader.ReadSingle(); y = _Reader.ReadSingle(); }
			}

			public struct	float3
			{
				public float x, y, z;
				public void		Read( BinaryReader _Reader )	{ x = _Reader.ReadSingle(); y = _Reader.ReadSingle(); z = _Reader.ReadSingle(); }
			}

			public struct	float4
			{
				public float x, y, z, w;
				public void		Read( BinaryReader _Reader )	{ x = _Reader.ReadSingle(); y = _Reader.ReadSingle(); z = _Reader.ReadSingle(); w = _Reader.ReadSingle(); }
			}

			public enum BUFFER_TYPE
			{
				UNKNOWN, U8, U32, FLOAT, FLOAT2, FLOAT3, FLOAT4
			}
			public object	DecodeBuffer( byte[] _Buffer, out BUFFER_TYPE _Type )
			{
				if ( _Buffer[0] != 'B' || _Buffer[1] != 'U' || _Buffer[2] != 'F' || _Buffer[3] != 'F' )
					throw new Exception( "Not a BUFFer !" );

				using ( MemoryStream Stream = new MemoryStream( _Buffer ) )
					using( BinaryReader Reader = new BinaryReader( Stream ) )
					{
						Reader.ReadInt32();	// Skip signature
						if ( Reader.ReadInt32() != 1 ) throw new Exception( "Unsupported version !" );

						int		FieldsCount = Reader.ReadInt32();
						if ( FieldsCount != 1 )
							throw new Exception( "WTF are those field thigs ???" );

						byte	FieldType = Reader.ReadByte();
						byte	ComponentsCount = Reader.ReadByte();

						_Type = BUFFER_TYPE.UNKNOWN;
						if ( FieldType == 2 )
						{	// UINT
							switch ( ComponentsCount )
							{
								case 1: _Type = BUFFER_TYPE.U32; break;
							}
						}
						else if ( FieldType == 1 )
						{	// FLOAT
							switch ( ComponentsCount )
							{
								case 1: _Type = BUFFER_TYPE.FLOAT;  break;
								case 2: _Type = BUFFER_TYPE.FLOAT2; break;
								case 3: _Type = BUFFER_TYPE.FLOAT3; break;
								case 4: _Type = BUFFER_TYPE.FLOAT4; break;
							}
						}

						int		Size = Reader.ReadInt32();

						switch ( _Type )
						{
							case BUFFER_TYPE.U32:
								{
									int[]	Result = new int[Size];
									for ( int i=0; i < Size; i++ )
										Result[i] = Reader.ReadInt32();
									return Result;
								}

							case BUFFER_TYPE.FLOAT:
								{
									float[]	Result = new float[Size];
									for ( int i=0; i < Size; i++ )
										Result[i] = Reader.ReadSingle();
									return Result;
								}

							case BUFFER_TYPE.FLOAT2:
								{
									float2[]	Result = new float2[Size];
									for ( int i=0; i < Size; i++ )
										Result[i].Read( Reader );
									return Result;
								}

							case BUFFER_TYPE.FLOAT3:
								{
									float3[]	Result = new float3[Size];
									for ( int i=0; i < Size; i++ )
										Result[i].Read( Reader );
									return Result;
								}

							case BUFFER_TYPE.FLOAT4:
								{
									float4[]	Result = new float4[Size];
									for ( int i=0; i < Size; i++ )
										Result[i].Read( Reader );
									return Result;
								}
						}
					}

				throw new Exception( "Unsupported buffer type !" );
			}
		}

		public static Primitive[]	ms_Primitives = null;

		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main()
		{
			System.Threading.Thread.CurrentThread.CurrentCulture = new System.Globalization.CultureInfo( "en-US" );

			if ( IndexBuffer.ms_Ranges.Length != VertexBuffer.ms_Ranges.Length )
				throw new Exception( "WTF ?" );
			ms_Primitives = new Primitive[IndexBuffer.ms_Ranges.Length];
			for ( int PrimitiveIndex=0; PrimitiveIndex < ms_Primitives.Length; PrimitiveIndex++ )
				ms_Primitives[PrimitiveIndex] = new Primitive();

			// Load & decode index file
			FileInfo	IBFileName = new FileInfo( "SourceData/index-buffers.bin" );
			using ( FileStream Stream = IBFileName.OpenRead() )
				using ( BinaryReader Reader = new BinaryReader( Stream ) )
				{
					for ( int PrimitiveIndex=0; PrimitiveIndex < ms_Primitives.Length; PrimitiveIndex++ )
					{
						IndexBuffer.IB	IB = IndexBuffer.ms_Ranges[PrimitiveIndex];
						Reader.BaseStream.Position = IB.Start;	// Start at appropriate position

						int		IBSize = IB.End - IB.Start;
						byte[]	Temp = new byte[IBSize];
						Reader.Read( Temp, 0, IBSize );

						ms_Primitives[PrimitiveIndex].DecodeIndexBuffer( Temp, IB );
					}
				}

			// Create the primitive descriptor
			FileInfo		PrimDescriptorsFileName = new FileInfo( "PrimitiveDescriptors.js" );
			StreamWriter	PrimDescriptorsWriter = PrimDescriptorsFileName.CreateText();
			PrimDescriptorsWriter.WriteLine( "var g_PrimDescriptors = [" );

			// Load & decode vertex file
			FileInfo	VBFileName = new FileInfo( "SourceData/vertex-buffers.bin" );
			using ( FileStream Stream = VBFileName.OpenRead() )
				using ( BinaryReader Reader = new BinaryReader( Stream ) )
				{
					for ( int PrimitiveIndex=0; PrimitiveIndex < ms_Primitives.Length; PrimitiveIndex++ )
					{
						ms_Primitives[PrimitiveIndex].DecodeVertexBuffer( Reader, VertexBuffer.ms_Ranges[PrimitiveIndex] );
						ms_Primitives[PrimitiveIndex].Save( new FileInfo( "ConvertedData/Blob" + PrimitiveIndex + ".bin" ) );
						ms_Primitives[PrimitiveIndex].AppendDescriptor( PrimDescriptorsWriter );
						ms_Primitives[PrimitiveIndex].Dispose();
					}
				}

			PrimDescriptorsWriter.WriteLine( "];" );
			PrimDescriptorsWriter.Flush();
			PrimDescriptorsWriter.Close();
			PrimDescriptorsWriter.Dispose();
		}
	}
}