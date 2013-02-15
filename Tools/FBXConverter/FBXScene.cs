using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace FBXConverter
{
	public class	FBXScene : IDisposable
	{
		#region NESTED TYPES

		#endregion

		#region FIELDS

		protected FBXImporterManaged.Scene	m_Scene = null;

		#endregion

		#region PROPERTIES

		#endregion

		#region METHODS

		public	FBXScene()
		{
			m_Scene = new FBXImporterManaged.Scene();
		}

		#region IDisposable Members

		public void Dispose()
		{
			m_Scene.Dispose();
		}

		#endregion

		/// <summary>
		/// Loads a FBX (or supported) file
		/// </summary>
		/// <param name="_SceneFile"></param>
		public void		Load( FileInfo _SceneFile )
		{
			if ( !_SceneFile.Exists )
				throw new Exception( "Scene file \"" + _SceneFile.FullName + "\" does not exist!" );

			m_Scene.LoadFile( _SceneFile.FullName );
		}

		#endregion

		#region EVENT HANDLERS

		#endregion
	}
}
