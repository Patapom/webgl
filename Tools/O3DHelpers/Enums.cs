using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace O3DHelpers
{
	public enum	PrimitiveType
	{
		POINTLIST = 1,		// Point list
		LINELIST = 2,		// Line list
		LINESTRIP = 3,		// Line Strip
		TRIANGLELIST = 4,	// Triangle List
		TRIANGLESTRIP = 5,	// Triangle Strip
		TRIANGLEFAN = 6,	// Triangle fan
	};

	public enum	Semantic
	{
		UNKNOWN_SEMANTIC = 0,
		POSITION = 1,		// Position
		NORMAL = 2,			// Normal
		TANGENT = 3,		// Tangent
		BINORMAL = 4,		// Binormal
		COLOR = 5,			// Color
		TEXCOORD = 6,		// Texture Coordinate
	};
}
