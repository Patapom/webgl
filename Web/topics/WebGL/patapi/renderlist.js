//////////////////////////////////////////////////////////////////////////
// This file contains the RenderList object that is capable of optimizing
//	primitives rendering by re-organizing them for a least amount of state changes
//////////////////////////////////////////////////////////////////////////
//
// The idea is to organize state changes by cost:
//	. Most costly changes are materials
//	. Next are textures (usually, because textures are several per primitive and can be very large)
//	. Next are the primitive buffers
//	. Finally we have the primitive uniforms
//
// We first group primitives per material, then subdivide this group per texture change by analyzing the primitive uniforms
//
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.scenefile' );
o3djs.provide( 'patapi.renderlist' );

// Add the renderlist extension
patapi.renderlist = patapi.renderlist || {};


//////////////////////////////////////////////////////////////////////////
// Attemps to build a render list from a Scene
// Returns a RenderList object
//
patapi.renderlist.CreateRenderList = function( gl, _Scene )
{
	return new patapi.RenderList( gl, _Scene );
}

//////////////////////////////////////////////////////////////////////////
// The RenderList object
patapi.RenderList = function( gl, _Scene )
{
	this.gl = gl;
	this.scene = _Scene;

	// Build the list of materials
	this.materialGroups = [];
	for ( var MatIndex=0; MatIndex < _Scene.materials.length; MatIndex++ )
	{
		var	Material = _Scene.materials[MatIndex];
		var	Group =
		{
			material : Material,
			textureGroups : [],
		};
		materialGroups.push( Group );

		// Retrieve the primitives using that material
		var	Primitives = [];
		for ( var PrimIndex=0; PrimIndex < _Scene.primitives.length; PrimIndex++ )
		{
			var	Primitive = _Scene.primitives[PrimIndex];
			if ( Primitive.material == Material )
				Primitives.push( Primitive );
		}

		// Recurse and organize
		this.OrganizeMaterialGroup( Group, Primitives );
	}
}

patapi.RenderList.prototype =
{
	// Sort primitives by their texture changes
	OrganizeMaterialGroup : function( _MaterialGroup, _Primitives )
	{
		var	Group =
		{
			parent : _MaterialGroup,
			primitiveGroups : [],
		};

		var	TextureUniformsHash = {};
		for ( var PrimIndex=0; PrimIndex < _Scene.primitives.length; PrimIndex++ )
		{
			var	Primitive = _Primitives[PrimIndex];

			// Build the uniforms hash that will concatenate a unique ID of texture combinations

			SORT uniforms by name first !

			var	UniformsHash = {};
			for ( var UniformIndex=0; UniformIndex < Primitive.uniformValues.length; UniformIndex++ )
			{
				var	PrimUniform = Primitive.uniformValues[UniformIndex].uniform;
				if ( Uniform.descriptor.type != this.gl.SAMPLER_2D )
					continue;	// Not a texture !

				var	UniformHash = PrimUniform.uniform.descriptor.name + "=" + PrimUniform.value.ID;
				UniformsHash[PrimUniform.uniform.descriptor.name] = UniformHash;
			}
			var	FinalHash = "";
			for (  )
		}
	},
}