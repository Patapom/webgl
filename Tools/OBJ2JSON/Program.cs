using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;

namespace OBJ2JSON
{
	class Program
	{
		class Face
		{
			public int	V0, V1, V2;
			public void	Parse( string _Indices )
			{
				string[]	Indices = _Indices.Split( '/' );

				if ( !int.TryParse( Indices[0], out V0 ) || !int.TryParse( Indices[1], out V1 ) || !int.TryParse( Indices[2], out V2 ) )
					throw new Exception( "Invalid face!" );

				// Are you stupid???
				V0--;
				V1--;
				V2--;
			}
		}
		static void Main( string[] args )
		{
			FileInfo	SourceFile = new FileInfo( "teapot.obj" );
//			FileInfo	SourceFile = new FileInfo( "teapot_normals_texture.obj" );
			FileInfo	TargetFile = new FileInfo( "teapot.json" );

			string	Content = null;
			using ( StreamReader R = SourceFile.OpenText() )
				Content = R.ReadToEnd();

			// Parse vertices & indices
			List<float>	Vertices = new List<float>();
			List<float>	Normals = new List<float>();
			List<float>	UVs = new List<float>();
			List<Face>	FacesVertices = new List<Face>();
			List<Face>	FacesNormals = new List<Face>();
			List<Face>	FacesUVs = new List<Face>();

			string	PrefF = "f ";
			string	PrefV = "v ";
			string	PrefVT = "vt ";
			string	PrefVN = "vn ";

			string[]	Lines = Content.Split( '\n' );
			foreach ( string Line in Lines )
			{
				if ( Line.StartsWith( PrefF ) )
				{	// Read face
					string[]	FacesString = Line.Remove( 0, PrefF.Length ).Split( ' ' );

					string[]	Indices0 = FacesString[0].Split( '/' );
					string[]	Indices1 = FacesString[1].Split( '/' );
					string[]	Indices2 = FacesString[2].Split( '/' );

					Face	F0 = new Face();
					F0.V0 = int.Parse( Indices0[0] )-1;
					F0.V1 = int.Parse( Indices1[0] )-1;
					F0.V2 = int.Parse( Indices2[0] )-1;

					Face	F1 = new Face();
					F1.V0 = int.Parse( Indices0[1] )-1;
					F1.V1 = int.Parse( Indices1[1] )-1;
					F1.V2 = int.Parse( Indices2[1] )-1;

					Face	F2 = new Face();
					F2.V0 = int.Parse( Indices0[2] )-1;
					F2.V1 = int.Parse( Indices1[2] )-1;
					F2.V2 = int.Parse( Indices2[2] )-1;

					FacesVertices.Add( F0 );
					FacesUVs.Add( F1 );
					FacesNormals.Add( F2 );
				}
				else if ( Line.StartsWith( PrefV ) )
				{	// Read vertex
					string[]	Coordinates = Line.Remove( 0, PrefV.Length ).Split( ' ' );
					float	X, Y, Z;
					if ( !float.TryParse( Coordinates[0], out X ) || !float.TryParse( Coordinates[1], out Y ) || !float.TryParse( Coordinates[2], out Z ) )
						throw new Exception( "Invalid vertex!" );

					Vertices.Add( X );
					Vertices.Add( Y );
					Vertices.Add( Z );
				}
				else if ( Line.StartsWith( PrefVN ) )
				{	// Read normal
					string[]	Coordinates = Line.Remove( 0, PrefVN.Length ).Split( ' ' );
					float	X, Y, Z;
					if ( !float.TryParse( Coordinates[0], out X ) || !float.TryParse( Coordinates[1], out Y ) || !float.TryParse( Coordinates[2], out Z ) )
						throw new Exception( "Invalid vertex normal!" );

					float	Norm = (float) Math.Sqrt( X*X + Y*Y + Z*Z );

					X /= Norm;
					Y /= Norm;
					Z /= Norm;

					Normals.Add( X );
					Normals.Add( Y );
					Normals.Add( Z );
				}
				else if ( Line.StartsWith( PrefVT ) )
				{	// Read UV
					string[]	Coordinates = Line.Remove( 0, PrefVT.Length ).Split( ' ' );
					float	U, V;
					if ( !float.TryParse( Coordinates[0], out U ) || !float.TryParse( Coordinates[1], out V ) )
						throw new Exception( "Invalid vertex!" );

					UVs.Add( U );
					UVs.Add( V );
				}
			}

			int	VerticesCount = Vertices.Count / 3;
// 			if ( Normals.Count / 3 != VerticesCount )
// 				throw new Exception( "Inconsistent amount of normals!" );
// 			if ( UVs.Count / 2 != VerticesCount )
// 				throw new Exception( "Inconsistent amount of UVs!" );

			// Center & normalize size
			float	MinX = +float.MaxValue, MaxX = -float.MaxValue;
			float	MinY = +float.MaxValue, MaxY = -float.MaxValue;
			float	MinZ = +float.MaxValue, MaxZ = -float.MaxValue;
			for ( int i=0; i < VerticesCount; i++ )
			{
				MinX = Math.Min( MinX, Vertices[3*i+0] ); MaxX = Math.Max( MaxX, Vertices[3*i+0] );
				MinY = Math.Min( MinY, Vertices[3*i+1] ); MaxY = Math.Max( MaxY, Vertices[3*i+1] );
				MinZ = Math.Min( MinZ, Vertices[3*i+2] ); MaxZ = Math.Max( MaxZ, Vertices[3*i+2] );
			}

			float	Scale = 2.0f / Math.Max( Math.Max( MaxX - MinX, MaxY - MinY ), MaxZ - MinZ );
			for ( int i=0; i < VerticesCount; i++ )
			{
				Vertices[3*i+0] = (Vertices[3*i+0] - 0*0.5f * (MinX + MaxX)) * Scale;
				Vertices[3*i+1] = (Vertices[3*i+1] - 0.5f * (MinY + MaxY)) * Scale;
				Vertices[3*i+2] = (Vertices[3*i+2] - 0*0.5f * (MinZ + MaxZ)) * Scale;
			}

			// Re-organize normals & UVs so they have the same indices as vertices (we don't care about collisions)
			float[]	NewNormals = new float[3*VerticesCount];
			float[]	NewUVs = new float[2*VerticesCount];
			for ( int i=0; i < FacesVertices.Count; i++ )
			{
				Face	FaceVertices = FacesVertices[i];
				Face	FaceNormals = FacesNormals[i];
				Face	FaceUVs = FacesUVs[i];

				// Reorganize normals
				NewNormals[3*FaceVertices.V0+0] = Normals[3*FaceNormals.V0+0];
				NewNormals[3*FaceVertices.V0+1] = Normals[3*FaceNormals.V0+1];
				NewNormals[3*FaceVertices.V0+2] = Normals[3*FaceNormals.V0+2];

				NewNormals[3*FaceVertices.V1+0] = Normals[3*FaceNormals.V1+0];
				NewNormals[3*FaceVertices.V1+1] = Normals[3*FaceNormals.V1+1];
				NewNormals[3*FaceVertices.V1+2] = Normals[3*FaceNormals.V1+2];

				NewNormals[3*FaceVertices.V2+0] = Normals[3*FaceNormals.V2+0];
				NewNormals[3*FaceVertices.V2+1] = Normals[3*FaceNormals.V2+1];
				NewNormals[3*FaceVertices.V2+2] = Normals[3*FaceNormals.V2+2];

				// Reorganize UVs
				NewUVs[2*FaceVertices.V0+0] = UVs[2*FaceUVs.V0+0];
				NewUVs[2*FaceVertices.V0+1] = UVs[2*FaceUVs.V0+1];

				NewUVs[2*FaceVertices.V1+0] = UVs[2*FaceUVs.V1+0];
				NewUVs[2*FaceVertices.V1+1] = UVs[2*FaceUVs.V1+1];

				NewUVs[2*FaceVertices.V2+0] = UVs[2*FaceUVs.V2+0];
				NewUVs[2*FaceVertices.V2+1] = UVs[2*FaceUVs.V2+1];
			}

			// Build tangents
			float[]	Tangents = new float[3*VerticesCount];
			for ( int i=0; i < VerticesCount; i++ )
			{
				float	Nx = NewNormals[3*i+0];
				float	Ny = NewNormals[3*i+1];
				float	Nz = NewNormals[3*i+2];

				float	Tx, Ty, Tz;
				if ( Math.Abs( Ny ) > 0.999f )
				{	// Special case
					Tx = 1.0f;
					Ty = 0.0f;
					Tz = 0.0f;
				}
				else
				{
					Tx = Nz;
					Ty = 0.0f;
					Tz = -Nx;
					float	L = 1.0f / (float) Math.Sqrt( Tx*Tx + Tz*Tz );
					Tx *= L;
					Tz *= L;
				}

				Tangents[3*i+0] = Tx;
				Tangents[3*i+1] = Ty;
				Tangents[3*i+2] = Tz;
			}

			// Convert into JSON
string	JSON = 
"{\n" +
// "	Version : 1,\n" + 
// "	Shaders :\n" +
// "	[\n" +
// "		{	ID : 0,\n" +
// "			Name : \"Simple\",\n" +
// "	} ],\n" +
// "\n" +
// "	Materials :\n" +
// "	[\n" +
// "		{	ID : 0,\n" +
// "			Name : \"Simple\",\n" +
// "			ShaderID : 0,\n" +
// "	} ],\n" +
// "\n" +
"	Primitives :\n" +
"	[\n" +
"		{	ID : 0,\n" +
"			Name : \"Teapot\",\n" +
// "			MatID : 0,\n" +
"			Topology : \"TRIANGLES\",\n" +
"			IndexStream : [\n" +
"				%INDICES%\n" +
"			],\n" +
"			VertexStreams : \n" +
"			[\n" +
"				{ Name : \"_vPosition\",\n" +
"				  Type : \"Float32Array\",\n" +
"				  Value : [\n" +
"					%VERTICES%\n" +
"					]\n" +
"				},\n" +
"				{ Name : \"_vNormal\",\n" +
"				  Type : \"Float32Array\",\n" +
"				  Value : [\n" +
"					%NORMALS%\n" +
"					]\n" +
"				},\n" +
"				{ Name : \"_vTangent\",\n" +
"				  Type : \"Float32Array\",\n" +
"				  Value : [\n" +
"					%TANGENTS%\n" +
"					]\n" +
"				},\n" +
"				{ Name : \"_vUV\",\n" +
"				  Type : \"Float32Array\",\n" +
"				  Value : [\n" +
"					%UVS%\n" +
"					]\n" +
"				},\n" +
"			],\n" +
"		},\n" +
"	]\n" +
"}\n";

			string	VerticesString = "";
			for ( int i=0; i < Vertices.Count; i++ )
				VerticesString += Vertices[i].ToString() + ", ";

			string	NormalsString = "";
			for ( int i=0; i < NewNormals.Length; i++ )
				NormalsString += NewNormals[i].ToString() + ", ";

			string	TangentsString = "";
			for ( int i=0; i < Tangents.Length; i++ )
				TangentsString += Tangents[i].ToString() + ", ";

			string	UVsString = "";
			for ( int i=0; i < NewUVs.Length; i++ )
				UVsString += NewUVs[i].ToString() + ", ";

			string	IndicesString = "";
			for ( int i=0; i < FacesVertices.Count; i++ )
			{
				Face	F = FacesVertices[i];
				IndicesString += F.V0.ToString() + ", ";
				IndicesString += F.V1.ToString() + ", ";
				IndicesString += F.V2.ToString() + ", ";
			}

			JSON = JSON.Replace( "%INDICES%", IndicesString );
			JSON = JSON.Replace( "%VERTICES%", VerticesString );
			JSON = JSON.Replace( "%NORMALS%", NormalsString );
			JSON = JSON.Replace( "%TANGENTS%", TangentsString );
			JSON = JSON.Replace( "%UVS%", UVsString );

			using ( StreamWriter W = TargetFile.CreateText() )
				W.Write( JSON );
		}
	}
}